/** Match CPA-Manager-Plus request monitoring: compare the response with the routed model. */
const SPEED_SUFFIX_RE = /-(?:ultrafast|fast)$/i;
const EFFORT_SUFFIX_RE = /-(none|off|minimal|low|medium|high|xhigh|max|ultra|auto)$/i;
const VARIANT_SUFFIX_RE = /-(?:ultrafast|fast|none|off|minimal|low|medium|high|xhigh|max|ultra|auto)$/i;

export function inferReasoningEffortFromModelName(name: string): string {
  const withoutSpeed = name.trim().replace(SPEED_SUFFIX_RE, '');
  const match = withoutSpeed.match(EFFORT_SUFFIX_RE);
  return match ? match[1].toLowerCase() : '';
}

function stripVariantSuffixes(name: string): { base: string; stripped: boolean } {
  let current = name.trim().toLowerCase();
  let stripped = false;
  while (VARIANT_SUFFIX_RE.test(current)) {
    current = current.replace(VARIANT_SUFFIX_RE, '');
    stripped = true;
  }
  return { base: current, stripped };
}

function isEquivalentResponseModel(resolved: string, responseModel: string): boolean {
  if (resolved === responseModel) return true;
  const left = stripVariantSuffixes(resolved);
  const right = stripVariantSuffixes(responseModel);
  const rightWithoutAntigravityN = right.base.endsWith('-n')
    ? right.base.slice(0, -2)
    : right.base;
  if (left.base && (left.base === right.base || left.base === rightWithoutAntigravityN)) {
    return left.stripped || right.stripped || right.base.endsWith('-n');
  }
  return false;
}

export function usageModelDetails(model: string, alias = '', response = '', reasoningEffort = '') {
  const resolved = model.trim();
  const trimmedAlias = alias.trim();
  const requested = trimmedAlias || resolved || '—';
  const responseModel = response.trim();
  const explicitEffort = reasoningEffort.trim();
  const effort = explicitEffort
    || inferReasoningEffortFromModelName(trimmedAlias)
    || inferReasoningEffortFromModelName(resolved);
  const mismatch = Boolean(responseModel && resolved && !isEquivalentResponseModel(resolved, responseModel));
  return {
    requested, resolved, response: responseModel, effort,
    showResolved: Boolean(resolved && resolved !== requested),
    mismatch,
    showResponseInTooltip: Boolean(responseModel && (!resolved || responseModel !== resolved)),
  };
}
