import {flattenDeep} from 'lodash'
import {Injectable} from '@nestjs/common'
import {InstanceWrapper} from '@nestjs/core/injector/instance-wrapper'
import {ModulesContainer} from '@nestjs/core/injector/modules-container'

import {RuleFactory} from './ability.types'

@Injectable()
export class AbilitiesExplorer {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore() {
    const modules = [...this.modulesContainer.values()]

    return flattenDeep(
      modules.map(
        (moduleRef) =>
          [...moduleRef.providers.values()] as InstanceWrapper<RuleFactory>[]
      )
    ).map((wrapper) => wrapper.instance)
  }
}
