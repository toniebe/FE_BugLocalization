export const metadata = {
  title: "Bug Knowledge Graph – Structuring Your Bug Resolution History",
  description:
    "A bug knowledge graph connects bugs, commits, files, and developers. Learn how EasyFix uses it to make bug resolution faster and more reliable.",
};

export default function BugKnowledgeGraphPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-invert">
        <h1>Bug Knowledge Graph – Structuring Your Bug Resolution History</h1>
        <p>
          Every resolved bug contains valuable information: what failed, why it
          failed, where in the codebase it lived, and how it was fixed. The
          problem is that this information is scattered across bug trackers,
          commit messages, and code reviews.
        </p>

        <p>
          A <strong>bug knowledge graph</strong> is a way of structuring this
          information into connected nodes and relationships that can be
          searched, analyzed, and reused.
        </p>

        <h2>What is a bug knowledge graph?</h2>
        <p>
          In a bug knowledge graph, you typically have nodes such as:
        </p>
        <ul>
          <li>Bug reports (issues, tickets).</li>
          <li>Commits and pull requests.</li>
          <li>Files, modules, or services.</li>
          <li>Developers or teams.</li>
        </ul>
        <p>And relationships such as:</p>
        <ul>
          <li>
            <em>(Bug)&nbsp;–&nbsp;[FIXED_BY]&nbsp;–&nbsp;(Commit)</em>
          </li>
          <li>
            <em>(Commit)&nbsp;–&nbsp;[TOUCHES]&nbsp;–&nbsp;(File)</em>
          </li>
          <li>
            <em>(Developer)&nbsp;–&nbsp;[AUTHORED]&nbsp;–&nbsp;(Commit)</em>
          </li>
        </ul>

        <h2>Why does a bug knowledge graph matter?</h2>
        <p>
          Once your bug resolution history is represented as a graph, you can
          ask powerful questions:
        </p>
        <ul>
          <li>Which files are associated with the most severe bugs?</li>
          <li>Which modules tend to regress after certain changes?</li>
          <li>Who are the go-to experts for a particular component?</li>
          <li>
            What patterns do we see in how similar bug types are resolved?
          </li>
        </ul>

        <h2>How EasyFix builds and uses a bug knowledge graph</h2>
        <p>
          EasyFix automatically constructs a bug knowledge graph from your
          existing tools:
        </p>
        <ul>
          <li>Bugzilla or other bug trackers for bug meta.</li>
          <li>Git repositories for commits, diffs, and file history.</li>
          <li>Developer metadata for authorship and ownership.</li>
        </ul>
        <p>
          This graph becomes the backbone of EasyFix&apos;s{" "}
          <strong>bug resolution</strong> and <strong>bug localization</strong>{" "}
          features. When you search for a bug, EasyFix doesn&apos;t just return
          text matches – it navigates the graph to find truly related cases.
        </p>

        <h2>From data exhaust to bug resolution insights</h2>
        <p>
          Most teams treat their bug history as data exhaust: useful in the
          moment, but quickly forgotten. By turning that history into a bug
          knowledge graph, EasyFix helps you build a compound asset that makes
          every future bug easier to resolve.
        </p>
      </article>
    </main>
  );
}
