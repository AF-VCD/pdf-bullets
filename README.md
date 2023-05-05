# _smarter_-pdf-bullets

This is a re-work of the original [pdf-bullets](https://github.com/AF-VCD/pdf-bullets) project, created and maintained by Christopher Kodama ad the members of the Air Force Volunteer Cyber Depository group.

## What are "Bullets"

One of the most pointless and time-consuming things that Air and Space Force officer and enlisted personnel do all the time is bullet-writing.

Air and Space Force personnel typically are required to write bullets for performance reports and award packages, and these bullets could mean the difference between the stagnation or advancement of an Airman or Guardian's career.

These bullets follow a few formatting rules:

- Each bullet must be exactly one line, with the width of the line depending on the form (performance reports, award packages, etc).
- Acronyms and abbreviations can be force-wide, organization, and/or commander-specific, with major inconsistencies with their abbreviation/acronym policies.

## How are Bullets Formatted

Those bullet formatting rules lead to the following:

- Information compression is prioritized over legibility
- Time is wasted on acronym and/or abbreviation revisions
- Bullet "appearance" becomes highly valued; some examples of arbitrary bullet appearance rules:
  - Any sort of repetition = bad
  - Bullets near flush with page boundaries = good

The purpose of _smarter_-pdf-bullets is to develop a set of tools to automate the pointless aspects of bullet-writing so that an officer and/or enlisted members can focus more on writing actual content rather than worry about irrelevant formatting.

## Application Usage

### Acronym List Imports

Note: When importing rules from a Excel (.xlsx) file containing acronym definition, the columns are:

| COLUMN NUMBER | COLUMN DESCRIPTION                                                         | EXAMPLE VALUES                                     |
| :------------ | :------------------------------------------------------------------------- | :------------------------------------------------- |
| 1             | Enabled: Boolean value, indicates whether to activate an acronym-word pair | TRUE, FALSE                                        |
| 2             | Word: String value that contains the full-form, un-abbreviated word        | "United States Space Force", "Command and Control" |
| 3             | Acronym: String value that contains the short-form, abbreviated word       | "USSF", "C2"                                       |

_CORRECT USAGE NOTE_: Sort the Excel sheet in DESCENDING ORDER. Due to the greedy nature of the replacement, the reverse sorted order is required to ensure proper compression of abbreviations.

_EXAMPLE OF INCORRECT USAGE_:
United States Air Force: USAF  
United States Air Force Academy: USAFA  
Will cause "United States Air Force Academy" to be abbreviated as "USAF Academy"

## Contributing

Below are some GitOps rules for contributing to this repository. As time moves forward, more formalized pull request and issue templates will be established.

### Github CI Pipeline

The Github workflow will automatically fire a build and test for the repository upon successful merging or pushing to the main branch.

### Pull Requests

When describing a pull request, please provide the following:

1. A title or summary as outlined in the [Committing and Merging](#committing-and-merging) section
2. A description of what was changed and whether it was attached to an existing issue

### Issues

When describing an issue, please provide the following:

1. A title or summary of the issues
2. Did the issue occur in the Local Development Environment or Production Environment?
   - If Local, describe the operating system and any other relevant information
3. Describe the expected behavior vs. the observed behavior
4. Provide all available error logs and network activity
5. Provide a recommended fix or area of concern

### Branching

When creating a branch, we like to follow the naming template:

`<STATEMENT OF BRANCH PURPOSE>`

Use a dash, `-`, as the delimiter, e.g., `this-is-a-feature-branch`

### Committing and Merging

When merging, we should squash all commits and follow the following commit message template:

`<TYPE>(<OPTIONAL SCOPE>): <DESCRIPTION OF STORY>`

Spaces are allowed within the description, e.g., `Feature(DSR): This revolves around the scope of DSRs`

| Type        | Description                                                                                            |
| :---------- | :----------------------------------------------------------------------------------------------------- |
| Feature     | Commits, that adds a new feature                                                                       |
| Fix         | Commits, that fixes a bug                                                                              |
| Refactor    | Commits, that rewrite/restructure your code, however does not change any behavior                      |
| Performance | Commits are special refactor commits, that improve performance                                         |
| Style       | Commits, that do not affect the meaning (white-space, formatting, missing semi-colons, etc)            |
| Test        | Commits, that add missing tests or correcting existing tests                                           |
| Docs        | Commits, that affect documentation only                                                                |
| Build       | Commits, that affect build components like build tool, ci pipeline, dependencies, project version, ... |
| Ops         | Commits, that affect operational components like infrastructure, deployment, backup, recovery, ...     |
| Chore       | Miscellaneous commits e.g. modifying .gitignore                                                        |
