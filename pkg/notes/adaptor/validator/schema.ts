import { z } from '@hono/zod-openapi';
import { EmojiSchema } from '../../model/reaction.js';

export const CommonErrorSchema = z.object({
  // ToDo: define error code list (oneOf)
  error: z.string().openapi({
    example: 'TEST_ERROR_CODE',
    description: 'Error code',
    default: '',
  }),
});

export const noteAttachmentSchema = z.object({
  id: z.string().openapi({
    example: '39783475',
    description: 'attachment Medium id',
  }),
  name: z.string().openapi({
    example: 'image.jpg',
    description: 'attachment filename',
  }),
  author_id: z.string().openapi({
    example: '309823457',
    description: 'attachment author account id',
  }),
  hash: z.string().openapi({
    example: 'e9f*5oin{dn',
    description: 'attachment medium blurhash',
  }),
  mime: z.string().openapi({
    example: 'image/jpeg',
    description: 'attachment medium mime type',
  }),
  nsfw: z.boolean().openapi({
    default: false,
    description: 'if true, attachment is nsfw',
  }),
  url: z.string().url().openapi({
    example: 'https://images.example.com/image.webp',
    description: 'attachment medium url',
  }),
  thumbnail: z.string().openapi({
    example: 'https://images.example.com/image_thumbnail.webp',
    description: 'attachment thumbnail url',
  }),
});

export const reactionSchema = z.object({
  emoji: EmojiSchema.openapi({
    description: 'Reaction Emoji (Unicode or Custom Emoji)',
    examples: ['🎉', '<:custom_emoji:123456789>'],
  }),
  reacted_by: z.string().openapi({
    example: '38477395',
    description: 'Reacted account ID',
  }),
});

export const CreateNoteRequestSchema = z.object({
  content: z.string().max(3000).openapi({
    example: 'hello world!',
    description:
      'Note content (max 3000 characters/if attachment file exists, allow 0 character)',
    default: '',
  }),
  visibility: z.string().openapi({
    example: 'PUBLIC',
    description: 'Note visibility (PUBLIC/HOME/FOLLOWERS/DIRECT)',
    default: 'PUBLIC',
  }),
  attachment_file_ids: z
    .array(z.string())
    .max(16)
    .openapi({
      example: ['38477395', '38477396'],
      description: 'Attachment file IDs (max 16 files)',
      default: [],
    }),
  contents_warning_comment: z.string().max(256).openapi({
    example: 'This note contains sensitive content',
    description: 'Contents warning comment (max 256 characters)',
    default: '',
  }),
  send_to: z.string().optional().openapi({
    example: '38477395',
    description: 'Send to account ID (if visibility is DIRECT)',
    default: '',
  }),
});

export const CreateNoteResponseSchema = z.object({
  id: z.string().openapi({
    example: '38477395',
    description: 'Note ID',
  }),
  content: z.string().openapi({
    example: 'hello world!',
    description: 'Note content',
  }),
  visibility: z.string().openapi({
    example: 'PUBLIC',
    description: 'Note visibility',
  }),
  contents_warning_comment: z.string().openapi({
    example: 'This note contains sensitive content',
    description: 'Contents warning comment',
  }),
  send_to: z.string().optional().openapi({
    example: '38477395',
    description: 'Send to account ID',
  }),
  author_id: z.string().openapi({
    example: '38477395',
    description: 'Author account ID',
  }),
  created_at: z.string().openapi({
    example: '2021-01-01T00:00:00Z',
    description: 'Note created date',
  }),
  attachment_files: z.array(noteAttachmentSchema).max(16).openapi({
    description: 'Note Attachment Media',
  }),
});

export const GetNoteResponseSchema = z.object({
  id: z.string().openapi({
    example: '38477395',
    description: 'Note ID',
  }),
  content: z.string().openapi({
    example: 'hello world!',
    description: 'Note content',
  }),
  contents_warning_comment: z.string().openapi({
    example: '(if length not 0) This note contains sensitive content',
    description: 'Contents warning comment',
  }),
  send_to: z.string().optional().openapi({
    example: '38477395',
    description: 'Send to account ID',
  }),
  visibility: z.string().openapi({
    example: 'PUBLIC',
    description: 'Note visibility (PUBLIC/HOME/FOLLOWERS/DIRECT)',
  }),
  created_at: z.string().datetime().openapi({
    example: '2021-01-01T00:00:00Z',
    description: 'Note created date',
  }),
  author: z.object({
    id: z.string(),
    name: z.string(),
    display_name: z.string(),
    bio: z.string(),
    avatar: z.string(),
    header: z.string(),
    followed_count: z.number(),
    following_count: z.number(),
  }),
  reactions: z.array(reactionSchema).openapi({
    description: 'Reactions',
  }),
  attachment_files: z.array(noteAttachmentSchema).max(16).openapi({
    description: 'Note Attachment Media',
  }),
});

export const RenoteRequestSchema = z.object({
  content: z.string().max(3000).openapi({
    example: 'hello world!',
    description:
      'Note content (max 3000 characters/if attachment file exists, allow 0 character)',
    default: '',
  }),
  visibility: z
    .union([z.literal('public'), z.literal('home'), z.literal('followers')])
    .openapi({
      example: 'public',
      description: 'Note visibility (public/home/followers)',
      default: 'public',
    }),
  attachment_file_ids: z
    .array(z.string())
    .max(16)
    .openapi({
      example: ['38477395', '38477396'],
      description: 'Attachment file IDs (max 16 files)',
      default: [],
    }),
  contents_warning_comment: z.string().max(256).openapi({
    example: 'This note contains sensitive content',
    description: 'Contents warning comment (max 256 characters)',
    default: '',
  }),
});

export const RenoteResponseSchema = z.object({
  id: z.string().openapi({
    example: '38477395',
    description: 'Note ID',
  }),
  content: z.string().openapi({
    example: 'hello world!',
    description: 'Note content',
  }),
  visibility: z.string().openapi({
    example: 'PUBLIC',
    description: 'Note visibility',
  }),
  original_note_id: z.string().openapi({
    example: '38477395',
    description: 'Original note ID',
  }),
  contents_warning_comment: z.string().openapi({
    example: 'This note contains sensitive content',
    description: 'Contents warning comment',
  }),
  author_id: z.string().openapi({
    example: '38477395',
    description: 'Author account ID',
  }),
  created_at: z.string().openapi({
    example: '2021-01-01T00:00:00Z',
    description: 'Note created date',
  }),
  attachment_files: z.array(noteAttachmentSchema).max(16).openapi({
    description: 'Note Attachment Media',
  }),
});

export const CreateReactionRequestSchema = z.object({
  emoji: z.string().openapi({
    example: '🎉',
    description: 'emoji',
  }),
});
export const CreateReactionResponseSchema = z.object({
  id: z.string().openapi({
    example: '38477395',
    description: 'Note ID',
  }),
  content: z.string().openapi({
    example: 'hello world!',
    description: 'Note content',
  }),
  visibility: z.string().openapi({
    example: 'PUBLIC',
    description: 'Note visibility',
  }),
  contents_warning_comment: z.string().openapi({
    example: 'This note contains sensitive content',
    description: 'Contents warning comment',
  }),
  author_id: z.string().openapi({
    example: '38477395',
    description: 'Author account ID',
  }),
  created_at: z.string().openapi({
    example: '2021-01-01T00:00:00Z',
    description: 'Note created date',
  }),
  attachment_files: z.array(noteAttachmentSchema).max(16).openapi({
    description: 'Note Attachment Media',
  }),
});

export const CreateBookmarkResponseSchema = z.object({
  id: z.string().openapi({
    example: '38477395',
    description: 'Note ID',
  }),
  content: z.string().openapi({
    example: 'hello world!',
    description: 'Note content',
  }),
  visibility: z.string().openapi({
    example: 'PUBLIC',
    description: 'Note visibility',
  }),
  contents_warning_comment: z.string().openapi({
    example: 'This note contains sensitive content',
    description: 'Contents warning comment',
  }),
  author_id: z.string().openapi({
    example: '38477395',
    description: 'Author account ID',
  }),
  created_at: z.string().openapi({
    example: '2021-01-01T00:00:00Z',
    description: 'Note created date',
  }),
  attachment_files: z.array(noteAttachmentSchema).max(16).openapi({
    description: 'Note Attachment Media',
  }),
});
