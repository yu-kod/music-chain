export default function PrivacyPage() {
  return (
    <div className="privacy">
      <h2>プライバシーポリシー</h2>

      <section>
        <h3>1. 運営者情報</h3>
        <p>本サービス「Music Chain」は個人が運営するWebアプリケーションです。</p>
      </section>

      <section>
        <h3>2. 取得する情報</h3>
        <p>
          本サービスでは、ユーザーの識別のためにCookieを使用しています。
          初回アクセス時にランダムなID（UUID）を発行し、Cookieに保存します。
          このIDは同一ユーザーによる重複投稿を防止する目的でのみ使用されます。
        </p>
        <p>氏名、メールアドレス、住所等の個人情報は一切収集しません。</p>
      </section>

      <section>
        <h3>3. Cookieについて</h3>
        <p>
          本サービスでは以下のCookieを使用します。
        </p>
        <ul>
          <li>
            <strong>userId</strong>：ユーザー識別用のランダムID（有効期限：1年間）
          </li>
        </ul>
        <p>
          ブラウザの設定によりCookieを無効にすることも可能ですが、
          その場合、投稿のたびに新しいユーザーとして扱われます。
        </p>
      </section>

      <section>
        <h3>4. 第三者サービス</h3>
        <p>本サービスでは以下の第三者サービスを利用しています。</p>
        <ul>
          <li>
            <strong>YouTube</strong>（Google LLC）：動画の埋め込み再生および動画情報の取得に使用しています。
            YouTubeの埋め込みプレーヤーを表示する際、Google社のCookieが設定される場合があります。
            詳細は
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google プライバシーポリシー
            </a>
            をご確認ください。
          </li>
          <li>
            <strong>Amazon Web Services</strong>（AWS）：サービスのホスティングおよびデータの保存に使用しています。
          </li>
        </ul>
      </section>

      <section>
        <h3>5. データの保存</h3>
        <p>
          ユーザーが投稿した曲のつながり情報（YouTube動画ID、コメント、ユーザーID）は
          AWSのサーバーに保存されます。投稿されたデータは本サービスの運営目的でのみ使用します。
        </p>
      </section>

      <section>
        <h3>6. ポリシーの変更</h3>
        <p>
          本ポリシーは予告なく変更する場合があります。
          変更後のポリシーは本ページに掲載した時点で効力を生じるものとします。
        </p>
      </section>

      <p className="text-sm text-muted mt-24">最終更新日：2026年3月31日</p>
    </div>
  );
}
