import { Option, Result } from '@mikuroxina/mini-fn';

import type { AccountID } from '../../../accounts/model/account.js';
import type { ID } from '../../../id/type.js';
import { Bookmark } from '../../model/bookmark.js';
import { type Note, type NoteID } from '../../model/note.js';
import type {
  BookmarkRepository,
  NoteRepository,
} from '../../model/repository.js';

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes: Map<ID<NoteID>, Note>;

  constructor(notes: Note[] = []) {
    this.notes = new Map(notes.map((note) => [note.getID(), note]));
  }

  async create(note: Note): Promise<Result.Result<Error, void>> {
    this.notes.set(note.getID(), note);
    return Result.ok(undefined);
  }

  async deleteByID(id: ID<NoteID>): Promise<Result.Result<Error, void>> {
    const target = await this.findByID(id);
    if (Option.isNone(target)) {
      return Result.err(new Error('note not found'));
    }

    this.notes.delete(Option.unwrap(target).getID());
    return Result.ok(undefined);
  }

  findByAuthorID(
    authorID: ID<AccountID>,
    limit: number,
  ): Promise<Option.Option<Note[]>> {
    const res = [...this.notes.values()].filter(
      (note) => note.getID() === authorID,
    );
    if (res.length === 0) {
      return Promise.resolve(Option.none());
    }
    return Promise.resolve(
      Option.some(
        res
          .sort((a, b) => (a.getCreatedAt() < b.getCreatedAt() ? 1 : -1))
          .slice(0, limit),
      ),
    );
  }

  findByID(id: ID<NoteID>): Promise<Option.Option<Note>> {
    const res = this.notes.get(id);
    if (!res) {
      return Promise.resolve(Option.none());
    }
    return Promise.resolve(Option.some(res));
  }
}

export class InMemoryBookmarkRepository implements BookmarkRepository {
  private readonly bookmarks: Map<`${ID<NoteID>}_${ID<AccountID>}`, Bookmark>;

  private generateBookmarkID(id: {
    noteID: ID<NoteID>;
    accountID: ID<AccountID>;
  }): `${ID<NoteID>}_${ID<AccountID>}` {
    return `${id.noteID}_${id.accountID}`;
  }

  constructor(bookmarks: Bookmark[] = []) {
    this.bookmarks = new Map(
      bookmarks.map((bookmark) => [
        this.generateBookmarkID({
          noteID: bookmark.getNoteID(),
          accountID: bookmark.getAccountID(),
        }),
        bookmark,
      ]),
    );
  }

  async create(id: {
    noteID: ID<NoteID>;
    accountID: ID<AccountID>;
  }): Promise<Result.Result<Error, void>> {
    const bookmark = Bookmark.new(id);
    this.bookmarks.set(this.generateBookmarkID(id), bookmark);
    return Result.ok(undefined);
  }

  async deleteByID(id: {
    noteID: ID<NoteID>;
    accountID: ID<AccountID>;
  }): Promise<Result.Result<Error, void>> {
    const target = await this.findByID(id);
    if (Option.isNone(target)) {
      return Result.err(new Error('bookmark not found'));
    }

    this.bookmarks.delete(this.generateBookmarkID(id));
    return Result.ok(undefined);
  }

  async findByID(id: {
    noteID: ID<NoteID>;
    accountID: ID<AccountID>;
  }): Promise<Option.Option<Bookmark>> {
    const res = this.bookmarks.get(this.generateBookmarkID(id));
    if (!res) {
      return Promise.resolve(Option.none());
    }
    return Promise.resolve(Option.some(res));
  }
}
