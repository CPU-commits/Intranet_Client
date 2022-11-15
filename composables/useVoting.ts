import { VotingStatus } from '~~/models/voting/voting.model'

export default function () {
	return useState<keyof typeof VotingStatus>('voting', () => 'waiting')
}
