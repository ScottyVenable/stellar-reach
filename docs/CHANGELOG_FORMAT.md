# Changelog Format

The root `CHANGELOG.md` is parsed at build time by `scripts/parse-changelog.mjs`
into `src/data/changelog.generated.json`, which the in-game changelog viewer
renders. The format below is **strict**: deviations will fail CI.

## File header

The file begins with a free-form preamble. The parser ignores everything
above the first `## ` heading.

## Release block grammar

Each release is a level-2 heading followed by optional metadata blocks and
a sequence of category sections.

```markdown
## [<VERSION>] - <YYYY-MM-DD> - <Channel>

**Title:** <Short release title — plain text, no emojis>

**Description:** <One paragraph. Wraps freely. May span multiple lines but
not multiple blank-line separated paragraphs.>

### Features
- Entry one. (#PR-or-issue-number optional)
- Entry two.

### Improvements
- ...

### Bug Fixes
- ...

### Balance
- ...

### Content
- ...

### Modding
- ...

### Internal
- ...
```

### Field rules

- `<VERSION>`: a SemVer string. May include the channel suffix
  (`-dev.<n>` or `-alpha.<n>`). The leading `[` and trailing `]` are
  required so the parser can locate the version unambiguously.
- `<YYYY-MM-DD>`: ISO date, UTC.
- `<Channel>`: exactly one of `Development`, `Alpha`, or `Stable`.
  Case-sensitive. The in-game viewer groups releases by channel.
- `**Title:**` and `**Description:**` are required for every release
  except `## [Unreleased]`.
- Categories are level-3 headings drawn from this fixed set:

  | Heading        | In-game label  |
  | -------------- | -------------- |
  | `Features`     | New            |
  | `Improvements` | Improvements   |
  | `Bug Fixes`    | Fixes          |
  | `Balance`      | Balance        |
  | `Content`      | Content        |
  | `Modding`      | Modding        |
  | `Internal`     | Internal       |

  Omit a category if it has no entries. Do not invent new categories;
  add them to this document and the parser first.

- Entries are dash-prefixed list items. They may span multiple lines as
  long as continuation lines are indented by two spaces. They may end
  with one or more issue or PR references in parentheses
  (`(#42)`, `(#42, #43)`).

## The Unreleased block

A single `## [Unreleased]` block lives at the top of the file and
collects entries that have not yet been versioned. It uses the same
category headings but no `**Title:**` / `**Description:**` and no date.
The version-bump workflow promotes it to a real release on PR merge:

- merge to `development` -> insert a new
  `## [<next-dev>] - <today> - Development` block above `[Unreleased]`,
  copy the Unreleased entries into it, and re-emit an empty
  `## [Unreleased]`.
- merge to `alpha` -> same, but the new heading uses `Alpha` and the
  version drops the `-dev.<n>` for `-alpha.<n>`.
- merge to `main` -> same, but `Stable` and no pre-release suffix.

## Round-trip guarantees

The parser preserves entry text verbatim (including links). The in-game
viewer renders entries as plain text with links auto-linked; no markdown
emphasis is interpreted at runtime.

## Versioning recap

```
MAJOR . MINOR . PATCH [ - <channel> . BUILD ]
```

`BUILD` is `git rev-list --count HEAD` and is **appended at build time**.
It is not written into `CHANGELOG.md` directly; only the human portion of
the version (and the channel) appears in the changelog headings. The
in-game viewer shows the full `version+build` string from
`changelog.generated.json` for the current build.
