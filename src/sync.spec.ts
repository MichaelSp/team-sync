import {afterEach, beforeEach, describe, expect, jest, mock, test} from 'bun:test'
import {synchronizeTeamData} from './sync'

const debugMock = jest.fn()
mock.module('@actions/core', () => {
  return {
    debug: debugMock
  }
})

describe('sync', () => {
  let client: any
  beforeEach(() => {
    client = {
      teams: {
        updateInOrg: jest.fn(),
        removeMembershipForUserInOrg: jest.fn(),
        create: jest.fn(),
        addOrUpdateMembershipForUserInOrg: jest.fn()
      }
    } as any
  })

  afterEach(() => {
    debugMock.mockRestore()
  })

  test.each([
    {in: 'abcd', out: 'abcd'},
    {in: 'a b c', out: 'a-b-c'},
    {in: 'a b c ', out: 'a-b-c'},
    {in: 'o-s-t', out: 'o-s-t'},
    {in: 'a_e', out: 'a_e'}
  ])('sluggification', async params => {
    await synchronizeTeamData(
      client,
      'org',
      'authenticatedUser',
      {
        [params.in]: {
          description: 'desc',
          slack: 'slack',
          members: [
            {name: 'hannibal', github: 'hannibal'},
            {name: 'murdock', github: 'murdock'}
          ]
        }
      },
      ''
    )
    expect(debugMock.mock.calls[0][0]).toEqual(`Desired team members for team slug ${params.out}:`)
  })

  test('synchronizeTeamData', async () => {
    await synchronizeTeamData(
      client,
      'org',
      'authenticatedUser',
      {
        'a-team': {
          description: 'desc',
          slack: 'slack',
          members: [
            {name: 'hannibal', github: 'hannibal'},
            {name: 'murdock', github: 'murdock'}
          ]
        }
      },
      'prefix'
    )
    expect(debugMock.mock.calls).toEqual([
      ['Desired team members for team slug prefix-a-team:'],
      ['["hannibal","murdock"]'],
      ['No team was found in org with slug prefix-a-team. Creating one.'],
      ['Removing creator (authenticatedUser) from prefix-a-team'],
      ['Adding hannibal to prefix-a-team'],
      ['Adding murdock to prefix-a-team']
    ])
    expect(client.teams.removeMembershipForUserInOrg).toHaveBeenCalledTimes(1)
    expect(client.teams.create).toHaveBeenCalledTimes(1)
    expect(client.teams.addOrUpdateMembershipForUserInOrg).toHaveBeenCalledTimes(2)
  })
})
