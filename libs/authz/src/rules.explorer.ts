import 'reflect-metadata'
import {flattenDeep, identity} from 'lodash'
import {Injectable} from '@nestjs/common'
import {MetadataScanner} from '@nestjs/core'
import {InstanceWrapper} from '@nestjs/core/injector/instance-wrapper'
import {Module} from '@nestjs/core/injector/module'
import {ModulesContainer} from '@nestjs/core/injector/modules-container'

import {RuleEnhancer, RulesMetadata, RULES_METADATA} from './ability.types'

type Rules = {enhancer: RuleEnhancer; meta: RulesMetadata}

@Injectable()
export class RulesExplorer {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {}

  explore() {
    const modules = [...this.modulesContainer.values()]

    return this.flatMap(modules, (instance) => this.filterRules(instance))
  }

  flatMap(
    modules: Module[],
    callback: (instance: InstanceWrapper, moduleRef: Module) => Rules[]
  ): Rules[] {
    return flattenDeep(
      modules.map((moduleRef) => {
        const providers = [...moduleRef.providers.values()]

        return providers.map((wrapper) => callback(wrapper, moduleRef))
      })
    ).filter(identity)
  }

  filterRules(wrapper: InstanceWrapper<RuleEnhancer>): Rules[] {
    const {instance} = wrapper
    if (!instance) {
      return []
    }

    const prototype = Object.getPrototypeOf(instance)

    return this.metadataScanner
      .scanFromPrototype(instance, prototype, () =>
        Reflect.getMetadata(RULES_METADATA, instance.constructor)
      )
      .filter(identity)
      .map((meta) => ({enhancer: instance, meta}))
  }
}
