---
title: copilot-agent-builder ではじめる Agent Skills 開発
tags:
  - GitHubCopilot
  - AgentSkills
  - VSCode
  - AI
  - npm
  - Harness最適化
private: false
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---

# copilot-agent-builder ではじめる Agent Skills 開発

GitHub Copilot の **Agent Skills** は、AI エージェントにドメイン固有の知識やワークフローを教えるための仕組みです。本記事では、`copilot-agent-builder` パッケージを使って Agent Skills 開発環境を即座にセットアップし、**対話的なコンテキスト収集**から**Harness 最適化**まで、一連のワークフローを解説します。

:::note info
Agent Skills と Harness 最適化の基礎については [GitHub Copilot Agent Skills の書き方 ― Harness最適化でAIエージェントの性能を引き上げる](https://qiita.com/hisaho/items/b3abdbf1df498c4244db) を先に読むことを推奨します。
:::

## Agent Skills とは？

Agent Skills は、AI エージェントに**プロジェクト固有の専門知識**を教えるための「フォルダ + SKILL.md」形式の仕組みです。

> スキル = フォルダ + `SKILL.md`（メタデータ＋指示書）

スキルは **Progressive Disclosure（段階的開示）** で動作します：

| フェーズ | 読み込む内容 | コスト |
|---------|------------|--------|
| Discovery | `name` と `description` のみ | ～100 トークン/スキル |
| Activation | SKILL.md 本文全体 | ～5,000 トークン推奨 |
| Execution | scripts/, references/, assets/ | 必要時のみ |

エージェント起動時に全スキルの `name` と `description` だけを走査し、ユーザーの質問にマッチしたスキルだけが本文をロードします。この設計により、数十のスキルを登録してもコンテキストウィンドウを圧迫しません。

## copilot-agent-builder とは？

[copilot-agent-builder](https://www.npmjs.com/package/copilot-agent-builder) は、Agent Skills の**開発支援ツールキット**を `npm install` 一発でプロジェクトに導入できるパッケージです。

含まれるもの：

- **6 つの開発支援スキル** — Purpose Discovery、スキル雛形生成、Harness 監査など
- **2 つの Custom Agent** — スキル開発者エージェント、Harness レビューアーエージェント
- **copilot-instructions.md** — Agent Skills 開発の規約・品質基準

**最大の特徴**は、ユーザーの入力が曖昧でも **対話しながらコンテキストを収集する仕組み（Purpose Discovery）** が組み込まれていることです。「スキルを作って」と一言伝えるだけで、エージェントが1問1答で要件を整理し、最適なスキルパッケージを生成します。

## クイックスタート

### 1. インストール

```bash
mkdir my-skills-project && cd my-skills-project
npm init -y
npm install copilot-agent-builder
```

`postinstall` フックにより `.github/` 配下にスキル開発ツールキットが自動コピーされます。

### 2. インストールされたファイルを確認

```bash
npx agent-builder status
```

```
Files that would be installed (19):
  [overwrite] .github/agents/harness-reviewer.md
  [overwrite] .github/agents/skill-developer.md
  [overwrite] .github/copilot-instructions.md
  [overwrite] .github/skills/description-optimizer/SKILL.md
  [overwrite] .github/skills/gotchas-curator/SKILL.md
  [overwrite] .github/skills/harness-auditor/SKILL.md
  [overwrite] .github/skills/orchestrator-designer/SKILL.md
  [overwrite] .github/skills/purpose-discovery/SKILL.md
  [overwrite] .github/skills/skill-scaffolder/SKILL.md
  ... (+ README.md, assets/, references/)
```

### 3. VS Code で開く

```bash
code .
```

VS Code が `.github/` 配下のスキルを自動認識します。Copilot Chat で `@workspace` に話しかけると、インストールされたスキルが利用可能になります。

## インストールされるスキル一覧

| スキル | 用途 | Harness 軸 |
|--------|------|-----------|
| **purpose-discovery** | スキル開発前の要件整理。1問1答で不足情報を収集 | Tool Coverage |
| **skill-scaffolder** | SKILL.md、AGENTS.md、Custom Agent の雛形生成 | Tool Coverage |
| **description-optimizer** | スキルの `description` を最適化して発見精度を向上 | Tool Coverage |
| **harness-auditor** | Harness 7軸フレームワークでスキル品質を監査 | Eval Coverage |
| **orchestrator-designer** | AGENTS.md の WHEN/DO ルーティング設計 | Tool Coverage |
| **gotchas-curator** | 開発中の学びを Gotchas セクションに蓄積 | Memory Persistence |

## 対話的コンテキスト収集 — Purpose Discovery

copilot-agent-builder の核心は、**ユーザーの入力情報が不足していても、対話しながら要件を自動収集する仕組み**です。

### なぜ必要か？

「コードレビューのスキルを作って」とだけ言われても、対象言語は？チーム規模は？セキュリティ基準は？—— 曖昧な依頼からは汎用的で使えないスキルしか生まれません。

copilot-agent-builder では、**スキル生成の前に必ず Purpose Discovery が起動**し、構造化された要件収集を行います。

### 8 要素の充足度チェック

Purpose Discovery はユーザーの入力を以下の **8 要素**で自動評価します：

| # | 要素 | 評価内容 |
|---|------|---------|
| 1 | **PURPOSE** | 何を達成したいか？最終目標は？ |
| 2 | **DOMAIN** | 対象ドメインは？（Web開発、データ分析、DevOps等） |
| 3 | **AUDIENCE** | 誰が使うか？（個人、チーム、組織） |
| 4 | **SCOPE** | 範囲は？（単一スキル or スイート構成） |
| 5 | **WORKFLOWS** | どんなワークフローか？（ステップ、判断ポイント） |
| 6 | **INTEGRATIONS** | 外部連携は？（API、MCP、ツール） |
| 7 | **REFERENCE MODEL** | 参考にするものは？（既存スキル、フレームワーク） |
| 8 | **QUALITY CRITERIA** | 品質基準は？（出力フォーマット、検証基準） |

### 対話フロー

```
ユーザー入力
    ↓
8 要素で充足度を自動評価
    ↓
┌─ 5/8 以上が明確 → スキル生成フェーズへ直行
└─ 5/8 未満 → 1問1答ダイアログ開始（最大 8 ラウンド）
                  ↓
              構造化仕様書を生成
                  ↓
              ユーザー承認 ⏸️
                  ↓
              スキル生成フェーズへ
```

### 対話の実例

たとえば「コードレビューのスキルを作って」と入力すると：

```
👤 ユーザー: コードレビューのスキルを作って

🤖 Copilot: 対象のプログラミング言語やフレームワークは何ですか？
   （例: TypeScript + React, Python + FastAPI）

👤 ユーザー: TypeScript と React

🤖 Copilot: レビューでは特にどの観点を重視しますか？
   （例: セキュリティ、パフォーマンス、コーディング規約）

👤 ユーザー: セキュリティとアクセシビリティ

🤖 Copilot: チームで共有するスキルですか？個人用ですか？

👤 ユーザー: チームで使う

🤖 Copilot: 以下の仕様で生成します。よろしいですか？ ⏸️
   PURPOSE: TypeScript/React のセキュリティ・アクセシビリティ重視レビュー
   DOMAIN: フロントエンド開発
   AUDIENCE: 開発チーム
   ...
```

**1問ずつ、不足分だけ**を聞くので、ユーザーの負担が最小になります。十分な情報が最初から含まれていれば、質問をスキップしてすぐに生成を開始します。

## 最初のスキルを作ってみよう

### ステップ 1: Copilot に依頼する

VS Code の Copilot Chat で以下のように入力します：

```
コードレビューのベストプラクティスをガイドするスキルを作成して
```

### ステップ 2: Purpose Discovery（自動）

不足情報があれば 1問1答で対話が始まります。5/8 以上が明確になれば構造化仕様書が提示され、承認後にスキル生成に進みます。

### ステップ 3: スキルが生成される

`skill-scaffolder` がプロジェクトルート直下にスキルパッケージを生成します：

```
code-review-guide/
├── AGENTS.md
├── copilot-instructions.md
├── README.md
├── group.json
├── skill.json
└── skills/
    └── review-checklist/
        ├── SKILL.md
        └── assets/
            └── review-template.md
```

### ステップ 4: Harness 7 軸チェック（自動）

生成されたスキルに対して、自動で **Harness 7 軸チェック**が実施されます。

## Harness 最適化 — 7 軸でスキル品質を担保する

**Harness** とは、AI コーディングエージェントが動作する **周辺環境全体** を指す概念です。[everything-claude-code（ECC）](https://github.com/affaan-m/everything-claude-code) が提唱する Harness Audit では、以下の 7 軸でエージェント環境を評価します。

> 「エージェントの完了品質を向上させるには、プロダクトコードではなく Harness 設定を改善する」

### 7 軸の詳細

| # | 軸 | 意味 | copilot-agent-builder での実践 |
|---|-----|------|------|
| 1 | **Tool Coverage** | Skills/Agents/Hooks/Commands の網羅性 | `description` の起動条件を明確化。WHEN/DO ルーティングでスキル間の棲み分けを設計 |
| 2 | **Context Efficiency** | コンテキストウィンドウの効率利用 | SKILL.md ≤ 500行。Progressive Disclosure。条件付き参照。MCP 10サーバー以下 |
| 3 | **Quality Gates** | テスト・検証パイプラインの充実度 | 各スキルに検証ループ（Validation Loop）+ 失敗時リカバリ手順を必須化 |
| 4 | **Memory Persistence** | セッション間のメモリ永続化 | Gotchas セクション 3項目以上。`gotchas-curator` で学びを蓄積 |
| 5 | **Eval Coverage** | 評価フレームワークの整備度 | 出力検証基準を明示。チェックリスト形式の Quality Gates |
| 6 | **Security Guardrails** | セキュリティチェック機構 | 禁止事項の明記。読み取り専用エージェントのツール制限 |
| 7 | **Cost Efficiency** | コスト最適化の仕組み | 冗長な記述排除。デフォルト明示で選択肢を減らす |

:::note info
Harness 7 軸の詳細な解説は [GitHub Copilot Agent Skills の書き方 ― Harness最適化でAIエージェントの性能を引き上げる](https://qiita.com/hisaho/items/b3abdbf1df498c4244db) を参照してください。
:::

### copilot-agent-builder が自動チェックする内容

スキル生成後、`harness-auditor` が全 7 軸を自動スコアリングします：

| # | 軸 | 合格基準 | チェック内容 |
|---|-----|---------|------------|
| 1 | Tool Coverage | ≥1 | description に起動条件あり、キーワード重複なし |
| 2 | Context Efficiency | ≥1 | SKILL.md ≤ 500行、条件付き参照 |
| 3 | Quality Gates | ≥1 | 検証ループ + 失敗時リカバリ |
| 4 | Memory Persistence | ≥1 | Gotchas 3項目以上（具体的） |
| 5 | Eval Coverage | ≥1 | 出力検証基準が明示されている |
| 6 | Security Guardrails | ≥1 | 禁止事項、データ取り扱いルール |
| 7 | Cost Efficiency | ≥1 | 冗長なし、デフォルト明示 |

- **ブロッキング**: いずれかの軸がスコア 0 → 修正して再チェック
- **合格**: 全 7 軸スコア 1 以上
- **推奨**: 総合 14/21 以上

## SKILL.md の書き方

Agent Skills の核となる `SKILL.md` は以下の構成で記述します：

```markdown
---
name: review-checklist
description: >
  コードレビューのベストプラクティスチェックリストを提供する。
  Use when コードレビューの実施時にチェック項目を確認したいとき。
---

# Review Checklist

## Use This Skill When

- コードレビューのチェック項目を確認したいとき
- PR のレビュー品質を向上させたいとき

## Workflow

1. 対象コードの言語・フレームワークを確認
2. チェックリストを適用
3. 指摘事項を優先度付きで出力

## Gotchas

- 言語固有のルールを見落としがち。フレームワーク名を確認すること
- セキュリティ観点のチェックを忘れやすい。OWASP Top 10 を常に確認
- テストカバレッジの確認を省略しがち。変更行に対するテスト有無を確認

## Validation Loop

1. 出力されたチェック項目を確認
2. [ ] 言語・フレームワークに適合しているか
3. [ ] セキュリティ観点が含まれているか
4. [ ] 優先度が付与されているか
→ 不合格の場合: 不足観点を追加して再生成
```

### description が命

`description` はエージェントがスキルを「発見」するための最重要フィールドです。**「何をするか」+「Use when〈起動条件〉」** の 2 部構成で書きます。

```yaml
# ✅ Good - 具体的で、起動条件が明確
description: >
  Extract PDF text, fill forms, merge files.
  Use when handling PDFs.

# ❌ Bad - 曖昧すぎる
description: Helps with PDFs.
```

### Gotchas — スキルで最も価値が高いセクション

エージェントが自力では知り得ない「落とし穴」のリストです。エージェントにミスを指摘・修正した際は、その内容を Gotchas セクションに追加しましょう。これがスキルを反復改善する最も効果的な方法です。

```markdown
## Gotchas

- `users` テーブルはソフトデリートを使用。クエリには必ず
  `WHERE deleted_at IS NULL` を含めること
- ユーザーIDは DB では `user_id`、認証サービスでは `uid`、
  課金APIでは `accountId`。すべて同じ値を指す
- `/health` エンドポイントは Web サーバーが動いていれば 200 を返す。
  DB接続確認には `/ready` を使うこと
```

### 検証ループ — エージェントに自己検証させる

```markdown
## Validation Loop

1. 編集を実施
2. `python scripts/validate.py output/` でバリデーション実行
3. バリデーション失敗時:
   - エラーメッセージを確認
   - 問題を修正
   - 再度バリデーション実行
4. バリデーション通過後のみ、次のステップへ
```

## Orchestrator パターン — 複数スキルを束ねる

スキルが増えてきたら、`AGENTS.md` を **Orchestrator（全体指揮書）** として使い、WHEN/DO 構文で適切なスキルをディスパッチします。

```markdown
# My Project Workflow

## タスク分類ルール

### パターン1: 調査タスク
WHEN: ユーザーが「調査」「リサーチ」「分析」を依頼
DO:
  1. planner スキルで計画を立案
  2. deep-research スキルで情報を収集
  3. writing スキルでレポートを生成

### パターン2: コードレビュー
WHEN: ユーザーが「レビュー」「コードチェック」を依頼
DO:
  1. security-review スキルでセキュリティチェック
  2. レビュー結果を指定フォーマットで出力
```

copilot-agent-builder の `orchestrator-designer` スキルが、WHEN/DO ルーティング・Phase ゲート・緊急度トリアージの設計を支援します。

## Custom Agent の活用

インストールされる 2 つの Custom Agent を活用できます。

### skill-developer Agent

フルライフサイクルの開発エージェント。スキルの設計から生成、検証、最適化まで一貫して実行します。

```
@skill-developer レビュースキルを最適化して
```

### harness-reviewer Agent

**読み取り専用**の監査エージェント。ツールを `read_file, grep_search, list_directory` に制限し、スキルの品質を Harness 7 軸で評価してレポートします。ファイルを変更しないので安全に実行できます。

```
@harness-reviewer 現在のスキルを監査して
```

## CLI リファレンス

```bash
# スキルファイルをプロジェクトにインストール（上書き）
npx agent-builder install

# 既存ファイルを保持して新規のみ追加
npx agent-builder install --no-overwrite

# インストール対象をプレビュー
npx agent-builder status
```

## ディレクトリ構成のベストプラクティス

```
my-project/
├── .github/                          # 開発支援ツール（copilot-agent-builder が配置）
│   ├── copilot-instructions.md       # 開発規約
│   ├── agents/                       # 開発支援 Custom Agents
│   └── skills/                       # 開発支援スキル
│
├── my-domain-skills/                 # ← あなたが作るスキルスイート
│   ├── AGENTS.md
│   ├── copilot-instructions.md
│   ├── skills/
│   │   ├── skill-a/
│   │   │   └── SKILL.md
│   │   └── skill-b/
│   │       ├── SKILL.md
│   │       └── assets/
│   └── agents/
│       └── specialist.md
│
├── package.json
└── node_modules/
```

- `.github/` — copilot-agent-builder が配置する開発支援ツール
- `<agent-skills-name>/` — あなたが作成するスキルスイート（プロジェクトルート直下）

## スキルを育てる成長ステップ

```
[1] 単体スキル      → SKILL.md 1つから始める
[2] 複数スキル      → description の棲み分けを設計
[3] Orchestrator    → AGENTS.md でワークフロー管理
[4] Custom Agent    → ツール制限付きの専門ペルソナ
[5] Harness 最適化  → 7軸スコアで継続的に改善
```

スキルは一度書いたら終わりではなく、**使いながら育てるもの**です。エージェントのミスを Gotchas に追記し、検証ループで品質を担保し、Harness 7 軸で定期的に自己評価しましょう。

## よくある質問

### Q: スキルが Copilot に認識されない

`description` フィールドに「Use when」句が含まれているか確認してください。`description-optimizer` スキルで最適化できます。曖昧な description は「存在するのに使われない」死蔵スキルの原因になります。

### Q: SKILL.md が長くなりすぎた

500 行を超える場合は `references/` ディレクトリに詳細情報を分離し、SKILL.md から**条件付き参照**を追加してください。

```markdown
<!-- ❌ 曖昧 -->
詳細は references/ を参照してください。

<!-- ✅ 条件付き -->
APIが 200 以外のステータスコードを返した場合は
`references/api-errors.md` を読んでください。
```

### Q: 複数スキル間でキーワードが重複する

`harness-auditor` でスキル間のキーワード衝突を検出できます。`description-optimizer` で棲み分けを最適化してください。

### Q: npm install で上書きされたくない

```bash
npx agent-builder install --no-overwrite
```

既存ファイルはスキップして新規ファイルのみ追加します。

## まとめ

| ステップ | コマンド / 操作 |
|---------|----------------|
| 1. 導入 | `npm install copilot-agent-builder` |
| 2. 確認 | `npx agent-builder status` |
| 3. 開発開始 | VS Code で Copilot Chat に依頼（Purpose Discovery が自動起動） |
| 4. 品質チェック | `@harness-reviewer` で 7 軸監査 |

`copilot-agent-builder` を使えば、Agent Skills の開発環境が即座に整い、**対話的コンテキスト収集（Purpose Discovery）→ スキル生成 → Harness 7 軸品質チェック**の一連のワークフローをすぐに始められます。

## リンク

- [npm: copilot-agent-builder](https://www.npmjs.com/package/copilot-agent-builder)
- [GitHub: agent-builder](https://github.com/nahisaho/agent-builder)
- [GitHub Copilot Agent Skills の書き方 ― Harness最適化でAIエージェントの性能を引き上げる](https://qiita.com/hisaho/items/b3abdbf1df498c4244db)
- [Agent Skills 公式サイト](https://agentskills.io/)
- [Agent Skills 仕様](https://agentskills.io/specification)
- [Agent Skills GitHub リポジトリ](https://github.com/agentskills/agentskills)
- [everything-claude-code（Harness Audit フレームワーク）](https://github.com/affaan-m/everything-claude-code)
