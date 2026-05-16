# Contributing to Verdura

Thank you for your interest in contributing to Verdura! To maintain a high-quality codebase, we follow specific conventions.

## Branch Naming Convention

- **Features**: `feat/short-description`
- **Bug Fixes**: `fix/short-description`
- **Documentation**: `docs/short-description`
- **Refactoring**: `refactor/short-description`
- **Testing**: `test/short-description`
- **Maintenance**: `chore/short-description`

Example: `feat/user-vaults`

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `type(scope): description`

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat(frontend): add vault creation form`

## Pull Request Checklist

Before submitting a PR, please ensure:
- [ ] Your code follows the project's coding standards.
- [ ] You have performed a self-review of your code.
- [ ] You have commented on your code, particularly in hard-to-understand areas.
- [ ] Your changes generate no new linting errors or warnings.
- [ ] Tests pass locally.
- [ ] PR title follows conventional commit format.

## Coding Standards

### Frontend
- Use TypeScript for all new code. Avoid `any`.
- Follow the App Router patterns (Server Components by default).
- Use Tailwind CSS for styling.
- Components should be modular and stored in `src/components`.

### Smart Contracts (Clarity)
- Use descriptive names for variables and functions.
- Include `asserts!` for all preconditions.
- Keep functions small and focused on a single task.
- Document all public functions.
