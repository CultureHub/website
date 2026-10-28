import {projectType} from './projectType'
import {artistType} from './artistType'
import {programType} from './programType'
import {artAndTechnologyPageType} from './artAndTechnologyPageType'
import {communityPageType} from './communityPageType'
import {opportunityType} from './opportunityType'
import {eventType} from './eventType'
import {articleType} from './articleType'
import {qaType, articleBlockTypes} from './articleBlocks'

export const schemaTypes = [
  projectType,
  artistType,
  programType,
  artAndTechnologyPageType,
  communityPageType,
  opportunityType,
  eventType,
  articleType,
  ...articleBlockTypes,
  qaType,
]
