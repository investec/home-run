npx create-typescript-app --base prompt --mode create

after forgetting that I needed to install the GitHub CLI I reattempted (see https://github.com/JoshuaKGoldberg/create-typescript-app/issues/1616)

```
This succeeded with this output:

◇ ✅ Passed creating repository structure.
│
◇ ✅ Passed adding contributors to table.
│
◇ ✅ Passed installing packages.
│
◇ ✅ Passed populating CSpell dictionary.
│
◇ ✅ Passed cleaning up files.
│
◇ ✅ Passed clearing any local Git tags.
│
◇ ✅ Passed initializing GitHub repository.
│
└ Great, looks like the script finished! 🎉

Be sure to:

- enable the GitHub apps:
  - Codecov (https://github.com/apps/codecov)
  - Renovate (https://github.com/apps/renovate)
- populate the secrets:
  - ACCESS_TOKEN (a GitHub PAT with repo and workflow permissions)
  - NPM_TOKEN (an npm access token with automation permissions)

See ya! 👋

│
● Tip: to run again with the same input values, use: npx create-typescript-app --base prompt --description "testing that initial npm publishing doesn't happen" --directory test-create-repo --email-github john.reilly@investec.com --email-npm john.reilly@investec.com --exclude-lint-json --exclude-lint-yml --mode create --owner investec --repository test-create-repo --title "Test Create Repo"
```

Notice that the repo created is public. This is the only option with CTA and so raised this issue: https://github.com/JoshuaKGoldberg/create-typescript-app/issues/1618

Then set repo to private. Deleted repo so we can have a clean start.

---

```
┌  ✨ Welcome to create-typescript-app 1.67.5! ✨
│
│  ⚠️ This template is early stage, opinionated, and not endorsed by the TypeScript team. ⚠️
│  ⚠️ If any tooling it sets displeases you, you can always remove that portion manually. ⚠️
│
◇  What organization or user will the repository be under?
│  investec
│
◇  What will the kebab-case name of the repository be?
│  home-run
│
◇  ✅ Passed checking GitHub authentication.
│
◇  How would you describe the new package?
│  Configure local development environments for Azure apps with one command
│
◇  What will the Title Case title of the repository be?
│  Home Run
│
◇  Select the tooling portions you'd like to remove. All are enabled by default. Press ↑ or ↓ to change the selected item, then space to select.
│  Add a tsup build step to generate built output files., Include eslint-plugin-eslint-comment to enforce good practices around ESLint comment directives., Include
eslint-plugin-jsdoc to enforce good practices around JSDoc comments., Add eslint-plugin-package-json to lint for package.json correctness., Add a pnpm dedupe workflow to
ensure packages aren't duplicated unnecessarily., Apply eslint-plugin-perfectionist to ensure imports, keys, and so on are in sorted order., Include eslint-plugin-regex to
enforce good practices around regular expressions., Include strict logical lint rules such as typescript-eslint's strict config. , Include stylistic lint rules such as
typescript-eslint's stylistic config., Add release-it to generate changelogs, package bumps, and publishes based on conventional commits., Add a Renovate config to keep
dependencies up-to-date with PRs., Add Vitest tooling for fast unit tests, configured with coverage tracking.
│
◇  ✅ Passed creating repository structure.
│
◇  ✅ Passed installing packages.
│
◇  ✅ Passed cleaning up files.
│
◇  ✅ Passed clearing any local Git tags.
│
◇  ✅ Passed initializing GitHub repository.
│
└  Great, looks like the script finished! 🎉

Be sure to:

- enable the GitHub apps:
   - Codecov (https://github.com/apps/codecov)
   - Renovate (https://github.com/apps/renovate)
- populate the secrets:
   - ACCESS_TOKEN (a GitHub PAT with repo and workflow permissions)
   - NPM_TOKEN (an npm access token with automation permissions)

See ya! 👋

│
●  Tip: to run again with the same input values, use: npx create-typescript-app --base prompt --description "Configure local development environments for Azure apps with one command" --directory home-run --email-github john.reilly@investec.com --email-npm john.reilly@investec.com --exclude-all-contributors --exclude-compliance --exclude-lint-json --exclude-lint-knip --exclude-lint-md --exclude-lint-spelling --exclude-lint-yml --mode create --owner investec --repository home-run --title "Home Run"
```

┌ ✨ Welcome to create-typescript-app 1.67.5! ✨
│
│ ⚠️ This template is early stage, opinionated, and not endorsed by the TypeScript team. ⚠️
│ ⚠️ If any tooling it sets displeases you, you can always remove that portion manually. ⚠️
│
◇ ✅ Passed checking GitHub authentication.
│
◇ ✅ Passed creating repository structure.
│
◇ ✅ Passed installing packages.
│
◇ ✅ Passed cleaning up files.
│
◇ ✅ Passed clearing any local Git tags.
│
◇ ✅ Passed initializing GitHub repository.
│
└ Great, looks like the script finished! 🎉

Be sure to:

- enable the GitHub apps:
  - Codecov (https://github.com/apps/codecov)
  - Renovate (https://github.com/apps/renovate)
- populate the secrets:
  - ACCESS_TOKEN (a GitHub PAT with repo and workflow permissions)
  - NPM_TOKEN (an npm access token with automation permissions)

See ya! 👋

│
● Tip: to run again with the same input values, use: npx create-typescript-app --base prompt --bin ./bin/index.js --description "Configure local development environments for Azure apps with one command" --directory home-run --email-github john.reilly@investec.com --email-npm john.reilly@investec.com --exclude-all-contributors --exclude-compliance --exclude-lint-json --exclude-lint-knip --exclude-lint-md --exclude-lint-spelling --exclude-lint-yml --mode create --owner investec --repository home-run --title "Home Run"
