# agent-builder

> `npm install` で GitHub Copilot の Agent Skills（`.github/`）をプロジェクトに配布するパッケージ

## インストール

```bash
npm install agent-builder
```

`npm install` 実行時に `postinstall` フックが自動で `.github/` 配下のファイルをプロジェクトルートにコピーします。

### コピーされるファイル

```
.github/
├── copilot-instructions.md    # プロジェクト共通の規約
├── agents/
│   ├── harness-reviewer.md    # Harness 監査エージェント
│   └── skill-developer.md     # スキル開発エージェント
└── skills/
    ├── description-optimizer/  # description 最適化スキル
    ├── gotchas-curator/        # Gotchas 収集スキル
    ├── harness-auditor/        # Harness 7軸監査スキル
    ├── orchestrator-designer/  # AGENTS.md 設計スキル
    ├── purpose-discovery/      # Purpose Discovery スキル
    └── skill-scaffolder/       # スキル雛形生成スキル
```

## CLI

手動でファイルを再インストールしたい場合：

```bash
# .github/ を現在のディレクトリにインストール（上書き）
npx agent-builder install

# 既存ファイルを保持して新規ファイルのみ追加
npx agent-builder install --no-overwrite

# インストールされるファイルをプレビュー
npx agent-builder status
```

## 動作仕様

| シナリオ | 動作 |
|---------|------|
| `npm install agent-builder` | 自動で `.github/` をプロジェクトルートにコピー（上書き） |
| `npx agent-builder install` | 手動で `.github/` をカレントディレクトリにコピー |
| `npx agent-builder install --no-overwrite` | 既存ファイルはスキップ、新規のみ追加 |
| パッケージ自身のディレクトリ内 | 自動インストールをスキップ |
| `INIT_CWD` 未設定 | 自動インストールをスキップ |

## License

MIT
