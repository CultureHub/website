import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createElement, type ComponentType} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import type {Rule, ValidationContext} from 'sanity'
import {featuredArticleType, readPageType} from '../schemaTypes/readPageType'
import {articleType} from '../schemaTypes/articleType'

test('the featured article icon renders in a Studio preview', () => {
  const Icon = featuredArticleType.icon
  assert.ok(Icon)
  assert.match(renderToStaticMarkup(createElement(Icon as ComponentType)), /<svg/)
})

type Validator = (value: unknown, context: ValidationContext) => unknown

function customValidator(validation: unknown): Validator {
  let validator: Validator | undefined
  const rule = {
    required() {
      return this
    },
    length() {
      return this
    },
    custom(fn: Validator) {
      validator = fn
      return this
    },
  }
  assert.equal(typeof validation, 'function')
  ;(validation as (rule: Rule) => unknown)(rule as unknown as Rule)
  assert.ok(validator)
  return validator
}

const context = (source: unknown, parent = {}) =>
  ({
    parent,
    getClient: () => ({fetch: async () => source}),
  }) as unknown as ValidationContext

test('Read selection callback rejects duplicates with different preview settings', async () => {
  const field = readPageType.fields.find((f) => f.name === 'featuredArticles')!
  const validate = customValidator(field.validation)
  assert.equal(
    await validate(
      ['a', 'b', 'c'].map((_ref) => ({article: {_ref}})),
      context(null),
    ),
    true,
  )
  assert.notEqual(
    await validate(
      [
        {article: {_ref: 'a'}, previewMode: 'image'},
        {article: {_ref: 'a'}, previewMode: 'text'},
        {article: {_ref: 'c'}},
      ],
      context(null),
    ),
    true,
  )
})

test('word count is required and bounded only for text-mode entries', async () => {
  const field = featuredArticleType.fields.find((f) => f.name === 'previewWordCount')!
  assert.equal(field.initialValue, 80)
  const validate = customValidator(field.validation)
  for (const value of [10, 80, 150])
    assert.equal(await validate(value, context(null, {previewMode: 'text'})), true)
  for (const value of [undefined, 9, 151, 12.5])
    assert.notEqual(await validate(value, context(null, {previewMode: 'text'})), true)
  assert.equal(await validate(undefined, context(null, {previewMode: 'image'})), true)
})

test('feature validation checks the referenced content instead of trusting mode settings', async () => {
  const validate = customValidator(featuredArticleType.validation)
  assert.equal(
    await validate(
      {article: {_ref: 'a'}, previewMode: 'image'},
      context({heroImage: {asset: {_ref: 'asset'}}}),
    ),
    true,
  )
  assert.notEqual(await validate({article: {_ref: 'a'}, previewMode: 'image'}, context({})), true)
  assert.equal(
    await validate(
      {article: {_ref: 'a'}, previewMode: 'text'},
      context({content: [{_type: 'articleText', text: [{_type: 'qa', question: 'Question?'}]}]}),
    ),
    true,
  )
  assert.notEqual(await validate({article: {_ref: 'a'}, previewMode: 'text'}, context(null)), true)
  const failing = {
    getClient: () => ({
      fetch: async () => {
        throw new Error('offline')
      },
    }),
  } as unknown as ValidationContext
  assert.match(
    String(await validate({article: {_ref: 'a'}, previewMode: 'image'}, failing)),
    /verify|retry/i,
  )
})

test('article type remains optional for existing articles', () => {
  const field = articleType.fields.find((f) => f.name === 'articleType')!
  assert.ok(field)
  assert.equal(field.validation, undefined)
})

// Only replace the remote Sanity request. A raw/drafts request returns the draft;
// the published perspective returns the same source used by the public route.
function divergentVersions(published: unknown, draft: unknown): ValidationContext {
  return {
    getClient: () => ({
      fetch: async (_query: string, params: {id: string}, options: {perspective?: string}) => {
        assert.equal(params.id, 'a')
        return options.perspective === 'published' ? published : draft
      },
    }),
  } as unknown as ValidationContext
}

test('an unpublished hero cannot make an incomplete published feature valid', async () => {
  const validate = customValidator(featuredArticleType.validation)
  const result = await validate(
    {article: {_ref: 'drafts.a'}, previewMode: 'image'},
    divergentVersions({}, {heroImage: {asset: {_ref: 'image-new'}}}),
  )
  assert.notEqual(result, true)
  assert.match(String(result), /publish/i)
})

test('an incomplete draft cannot invalidate a usable published text preview', async () => {
  const validate = customValidator(featuredArticleType.validation)
  assert.equal(
    await validate(
      {article: {_ref: 'a'}, previewMode: 'text'},
      divergentVersions(
        {
          content: [
            {
              _type: 'articleText',
              text: [{_type: 'block', children: [{_type: 'span', text: 'Published opening.'}]}],
            },
          ],
        },
        {},
      ),
    ),
    true,
  )
})

test('draft-only articles must be published before they can be featured', async () => {
  const validate = customValidator(featuredArticleType.validation)
  const result = await validate(
    {article: {_ref: 'a'}, previewMode: 'image'},
    divergentVersions(null, {heroImage: {asset: {_ref: 'image-draft'}}}),
  )
  assert.notEqual(result, true)
  assert.match(String(result), /publish/i)
})
