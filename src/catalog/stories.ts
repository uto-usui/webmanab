// stories/*.stories.ts を集めて id を振る。Story.astro と index.json.ts の両方がここを見る
import {
  WIDTHS,
  type Args,
  type Meta,
  type Story,
  type StoryEntry,
} from './types'

interface StoryModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: Meta<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: Story<any>
}

// getStaticPaths の props に渡すので、index signature を求められる interface ではなく type にする
export type ResolvedStory = {
  entry: StoryEntry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Meta<any>['component']
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Args<any>
}

const kebab = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const modules = import.meta.glob<StoryModule>('./stories/*.stories.ts', {
  eager: true,
})

export const stories: ResolvedStory[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .flatMap(([file, mod]) => {
    const component = file.replace(/^.*\/(.+)\.stories\.ts$/, '$1')
    const meta = mod.default
    return Object.entries(mod)
      .filter(([name]) => name !== 'default')
      .map(([name, story]) => {
        const { widths = [...WIDTHS], ...catalog } = {
          ...meta.parameters?.catalog,
          ...story.parameters?.catalog,
        }
        return {
          entry: {
            id: `${kebab(component)}/${kebab(name)}`,
            component,
            name,
            widths,
            ...catalog,
          },
          component: meta.component,
          args: { ...meta.args, ...story.args },
        }
      })
  })
