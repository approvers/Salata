import { Result } from '@mikuroxina/mini-fn';

import type { AccountModule } from '../../intermodule/account.js';
import type { Note } from '../../notes/model/note.js';
import type { TimelineNotesCacheRepository } from '../model/repository.js';
import type { NoteVisibilityService } from './noteVisibility.js';

export class PushTimelineService {
  constructor(
    private readonly accountModule: AccountModule,
    private readonly noteVisibility: NoteVisibilityService,
    private readonly timelineNotesCacheRepository: TimelineNotesCacheRepository,
  ) {}

  /**
   * @description Push note to home timeline
   * @param note to be pushed
   * */
  async handle(note: Note): Promise<Result.Result<Error, void>> {
    const followers = await this.accountModule.fetchFollowers(
      note.getAuthorID(),
    );
    if (Result.isErr(followers)) {
      return followers;
    }
    const unwrappedFollowers = Result.unwrap(followers);

    /*
    PUBLIC, HOME, FOLLOWER: OK
    DIRECT: reject (direct note is not pushed to home timeline)
     */
    const isNeedReject =
      !(await this.noteVisibility.homeTimelineVisibilityCheck({
        accountID: note.getAuthorID(),
        note,
      }));
    if (isNeedReject) {
      return Result.err(new Error('Note is not visible'));
    }

    // ToDo: bulk insert
    const res = await Promise.all(
      unwrappedFollowers.map((v) => {
        return this.timelineNotesCacheRepository.addNotesToHomeTimeline(v.id, [
          note,
        ]);
      }),
    );
    if (res.some(Result.isErr)) {
      return res.find(Result.isErr)!;
    }

    return Result.ok(undefined);
  }
}
