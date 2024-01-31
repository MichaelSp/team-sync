import {expect, jest, test, describe, mock} from 'bun:test'
import {getTeamData} from './get-team-data'

mock.module('@actions/github', () => {
  return {
    context: {
      repo: {
        owner: 'owner',
        repo: 'repo'
      }
    }
  }
})

describe('get-team-data', () => {
  test('throws invalid json', async () => {
    const client = {
      repos: {getContent: jest.fn()}
    } as any
    client.repos.getContent.mockReturnValue({data: {content: '', encoding: 'utf8'}})
    expect(getTeamData(client, 'input.json')).rejects.toThrow('JSON Parse error: Unexpected EOF')
  })

  test('read empty file', () => {
    const client = {
      repos: {getContent: jest.fn()}
    } as any
    client.repos.getContent.mockReturnValue({data: {content: '{}', encoding: 'utf8'}})
    expect(getTeamData(client, 'input.json')).resolves.toEqual({})
  })

  test('read empty yaml file', () => {
    const client = {
      repos: {getContent: jest.fn()}
    } as any
    client.repos.getContent.mockReturnValue({data: {content: '---', encoding: 'utf8'}})
    expect(getTeamData(client, 'input.yml')).resolves.toEqual({})
  })

  test('read yaml file', () => {
    const client = {
      repos: {getContent: jest.fn()}
    } as any
    client.repos.getContent.mockReturnValue({
      data: {
        content: `
  a-team:
    description: desc
    slack: slack
    members:
    - github: hannibal
    - github: murdock
    `,
        encoding: 'utf8'
      }
    })
    expect(getTeamData(client, 'input.yml')).resolves.toEqual({
      'a-team': {
        description: 'desc',
        slack: 'slack',
        members: [{github: 'hannibal'}, {github: 'murdock'}]
      }
    })
  })
})
