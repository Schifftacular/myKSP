/**
 * Parser for KSP ConfigNode text (persistent.sfs, .craft, .cfg).
 *
 * Format: `key = value` lines and `NAME` followed by `{ ... }` blocks, nestable, keys may repeat,
 * `//` starts a comment. Tolerates CRLF, tabs, `NAME {` on one line, and `NAME { k = v }` inline.
 * Read-only by design: nothing in myKSP ever writes a save.
 */
export interface CfgNode {
  name: string;
  values: [string, string][];
  nodes: CfgNode[];
}

export function get(n: CfgNode | undefined, key: string): string | undefined {
  if (!n) return undefined;
  for (const [k, v] of n.values) if (k === key) return v;
  return undefined;
}

export function getAll(n: CfgNode | undefined, key: string): string[] {
  return n ? n.values.filter(([k]) => k === key).map(([, v]) => v) : [];
}

export function child(n: CfgNode | undefined, name: string): CfgNode | undefined {
  return n?.nodes.find((c) => c.name === name);
}

export function children(n: CfgNode | undefined, name: string): CfgNode[] {
  return n ? n.nodes.filter((c) => c.name === name) : [];
}

export function getNum(n: CfgNode | undefined, key: string): number | null {
  const v = get(n, key);
  if (v === undefined) return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

/** Tokenize into a flat stream: '{', '}', or a line of text. */
function* tokens(text: string): Generator<string> {
  const lines = text.split(/\r?\n/);
  for (let raw of lines) {
    const c = raw.indexOf('//');
    if (c >= 0) raw = raw.slice(0, c);
    // Split braces out of a line so "NAME {", "{ k = v }" and "}" all work.
    let buf = '';
    for (const ch of raw) {
      if (ch === '{' || ch === '}') {
        if (buf.trim()) yield buf.trim();
        yield ch;
        buf = '';
      } else buf += ch;
    }
    if (buf.trim()) yield buf.trim();
  }
}

export function parseCfg(text: string): CfgNode {
  const root: CfgNode = { name: 'root', values: [], nodes: [] };
  const stack: CfgNode[] = [root];
  let pendingName: string | null = null;
  for (const tok of tokens(text)) {
    const top = stack[stack.length - 1];
    if (tok === '{') {
      const node: CfgNode = { name: pendingName ?? '', values: [], nodes: [] };
      top.nodes.push(node);
      stack.push(node);
      pendingName = null;
    } else if (tok === '}') {
      if (pendingName !== null) {
        // A bare word before a closing brace is malformed; keep it as an empty-valued key.
        top.values.push([pendingName, '']);
        pendingName = null;
      }
      if (stack.length > 1) stack.pop();
    } else {
      if (pendingName !== null) {
        // Previous bare word was not a node header after all.
        top.values.push([pendingName, '']);
        pendingName = null;
      }
      const eq = tok.indexOf('=');
      if (eq >= 0) top.values.push([tok.slice(0, eq).trim(), tok.slice(eq + 1).trim()]);
      else pendingName = tok;
    }
  }
  return root;
}
