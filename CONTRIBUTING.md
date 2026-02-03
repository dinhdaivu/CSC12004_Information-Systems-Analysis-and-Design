# Contributing Guidelines

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Development Workflow

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Make changes**: Implement your feature
3. **Commit**: `git commit -m "feat: description of changes"`
4. **Push**: `git push origin feature/your-feature-name`
5. **Create PR**: Submit pull request with description

## Commit Message Convention

Follow Angular's commit message convention:

```
type(scope): subject

feat: add new feature
fix: fix bug
docs: update documentation
style: code style changes
refactor: code refactoring
perf: performance improvement
test: add tests
chore: maintenance tasks
```

## Code Style

### Frontend (Angular)
- Use TypeScript strict mode
- Follow Angular style guide
- Use standalone components
- ESLint configuration

### Backend (Express)
- Use TypeScript
- Follow ESLint configuration
- Add JSDoc comments
- Unit tests required

## Testing

- Write tests for new features
- Maintain >70% code coverage
- Run tests before pushing: `npm test`

## Pull Request Process

1. Update documentation
2. Add tests for changes
3. Run all tests locally
4. Request review from team members
5. Address review feedback

## Questions?

Contact the team lead or create an issue on GitHub.
