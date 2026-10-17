# maruni-memo の運用ルール

## 作業の完了条件

このリポジトリで変更を行った場合は、ユーザーが明示的に止めない限り、必ず以下をすべて実施する。コード、デザイン、画像、設定、ドキュメントの変更も対象とする。

1. 差分を確認し、変更内容に応じた検証を行う。
2. 変更を意味の分かるメッセージで commit する。
3. `origin/main` に push する。
4. 対象コミットの GitHub Pages のデプロイ成功を確認する。
5. 公開サイトで変更内容の反映を確認する。画面・操作の変更は必要に応じてブラウザでも確認する。

commit、push、公開反映の確認が完了するまで、作業を完了扱いにしない。失敗した場合は原因を調べ、可能な範囲で修復する。解消できない場合は、完了した段階と未完了の理由を明確に伝える。

通常の作業では、この手順の実行について毎回確認を求めない。ユーザーの明示的な指示を優先する。確認・調査だけで変更がない場合、空のコミットは作成しない。

認証情報、個人のメモ、不要な一時ファイルをコミットしない。既存の未コミット変更は確認して扱い、無関係な変更を混ぜたり上書きしたりしない。force push は行わない。

## 公開先

- リポジトリ: https://github.com/ichimaruni/maruni-memo
- 公開サイト: https://ichimaruni.github.io/maruni-memo/
- 公開元: `main` ブランチのルート
- 作業ディレクトリ: `/Users/saikai/projects/maruni-memo`

## Maruni Repos との連携（壊さないこと）

Mac用ファイルブラウザ「Maruni Repos」（https://github.com/ichimaruni/maruni-repos ）は、メモのタブで公開サイトをそのまま WKWebView（Safari と同じエンジン）に読み込んで使っている。公開サイトへの変更はアプリにも即座に反映されるため、次の取り決めを変えない。変える必要がある場合は、Maruni Repos 側（`Sources/MaruniReposApp/Views/MemoTabView.swift` の `MemoSession`）も同時に直す。

- アプリ内かどうかは `window.webkit.messageHandlers.maruniRepos` の有無で判定している（`host`）。このとき `<html>` に `embedded` クラスが付き、新規・保存・ファイルを開くボタンは隠れる。
- ページの準備ができたら `host.postMessage({ type: "ready" })` を送る。
- アプリは `window.maruniMemoHost.open(fileName, jsonText)` でメモファイルを渡す。戻り値は開けたら `true`、メモのファイルでなければ `false`。
- 変更のたびに `host.postMessage({ type: "save", text })` を送る。`text` はファイルに保存する JSON（`kind: "maruni-memo"`、`v`、`savedAt`、`html`、`shapes`）で、アプリはこれを同じファイルにそのまま書き込む。
- アプリは `window.maruniMemoHost.flush()` で入力途中の内容を保存させる。
- アプリの詳細パネルは `window.maruniMemoHost.preview(fileName, jsonText)` でメモを読み取り専用で表示する（`<html>` に `preview` クラス、編集・保存なし、ツールバーなし）。
- アプリ内では localStorage・最近のファイル（IndexedDB）・ファイル選択・ドロップで開く機能を使わない。

アプリ内は Safari のエンジンで動くため、入力まわりの変更は Safari でも確認する（日本語入力の変換確定などで、Chrome と挙動が異なることがある）。
