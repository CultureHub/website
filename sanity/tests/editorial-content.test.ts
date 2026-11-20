import assert from 'node:assert/strict'
import {test} from 'node:test'
import {
  canonicalId,
  isYoutubeId,
  openingText,
  truncateWords,
  validateFeaturedSelection,
  validatePreviewSource,
} from '../../shared/editorial/content'

const paragraph = (text: string) => ({_type: 'block', children: [{_type: 'span', text}]})
const textContent = [{_type: 'articleText', text: [paragraph('Opening words.')]}]

test('opening text walks Q&A and image-text in document order, ignoring images and quotes', () => {
  assert.equal(
    openingText([
      {_type: 'articleImage'},
      {_type: 'pullQuote', text: 'Do not repeat this.'},
      {
        _type: 'articleText',
        text: [{_type: 'qa', question: 'Why?', answer: [paragraph('Because art matters.')]}],
      },
      {_type: 'imageText', text: [paragraph('Next.')]},
    ]),
    'Why? Because art matters. Next.',
  )
})

test('opening text joins spans without inserting spaces inside a word', () => {
  assert.equal(
    openingText([
      {
        _type: 'articleText',
        text: [
          {
            _type: 'block',
            children: [
              {_type: 'span', text: '  Hel'},
              {_type: 'span', text: 'lo\nworld.  '},
            ],
          },
        ],
      },
    ]),
    'Hello world.',
  )
})

test('missing, empty, whitespace-only and nontext content have no opening text', () => {
  for (const value of [
    undefined,
    null,
    [],
    [{_type: 'articleImage'}],
    [{_type: 'articleText', text: [paragraph('  ')]}],
  ]) {
    assert.equal(openingText(value), '')
  }
})

test('word truncation only appends an ellipsis when content was removed', () => {
  assert.equal(truncateWords('one  two\nthree four', 3), 'one two three…')
  assert.equal(truncateWords('one two three', 3), 'one two three')
  assert.equal(truncateWords('', 80), '')
  for (const count of [0, -1, 1.5, Infinity, NaN])
    assert.equal(truncateWords('some text', count), '')
})

test('featured selections require exactly three distinct nonempty references', () => {
  const entries = ['a', 'b', 'c'].map((_ref) => ({article: {_ref}}))
  assert.equal(validateFeaturedSelection(entries), true)
  for (const value of [
    undefined,
    [],
    entries.slice(0, 2),
    [...entries, entries[0]],
    [{}, ...entries.slice(1)],
  ]) {
    assert.notEqual(validateFeaturedSelection(value), true)
  }
  assert.notEqual(
    validateFeaturedSelection([{article: {_ref: 'a'}}, {article: {_ref: 'drafts.a'}}, entries[1]]),
    true,
  )
  assert.equal(canonicalId('drafts.a'), 'a')
  assert.equal(canonicalId('a'), 'a')
})

test('preview validation distinguishes real hero assets from text-bearing content', () => {
  assert.equal(validatePreviewSource('image', {heroImage: {asset: {_ref: 'image-id'}}}), true)
  assert.notEqual(validatePreviewSource('image', {heroImage: {asset: null}}), true)
  assert.notEqual(validatePreviewSource('image', {content: textContent}), true)
  assert.equal(validatePreviewSource('text', {content: textContent}), true)
  assert.equal(
    validatePreviewSource('text', {
      content: [{_type: 'articleText', text: [{_type: 'qa', question: 'Why?'}]}],
    }),
    true,
  )
  assert.notEqual(validatePreviewSource('text', {content: [{_type: 'articleImage'}]}), true)
  assert.notEqual(validatePreviewSource('text', null), true)
})

test('YouTube ID validation only accepts the exact ID alphabet and length', () => {
  assert.equal(isYoutubeId('M7lc1UVf-VE'), true)
  for (const input of [
    undefined,
    null,
    '',
    'short',
    'M7lc1UVf-VE/',
    'https://example.com/embed/x',
    'M7lc1UVf VE',
  ]) {
    assert.equal(isYoutubeId(input), false)
  }
})
