import { expect, test } from 'bun:test';
import { usageModelDetails } from '../src/services/usageModel';

test('compares reported response with routed model, not the requested alias', () => {
  expect(usageModelDetails('gpt-routed', 'my-alias', 'gpt-routed')).toMatchObject({ showResolved: true, mismatch: false, showResponseInTooltip: false });
  expect(usageModelDetails('gpt-routed', 'my-alias', 'my-alias')).toMatchObject({ mismatch: true });
  expect(usageModelDetails('gpt-routed', '', 'different')).toMatchObject({ showResolved: false, mismatch: true });
});

test('missing response and route degrade without inventing model names', () => {
  expect(usageModelDetails('gpt-routed', '', '  ')).toMatchObject({ requested: 'gpt-routed', mismatch: false });
  expect(usageModelDetails('', 'alias', 'reported')).toMatchObject({ mismatch: false, showResponseInTooltip: true });
  expect(usageModelDetails(' gpt-routed ', ' gpt-routed ', ' gpt-routed ')).toMatchObject({ showResolved: false, mismatch: false });
});

test('treats Antigravity thinking-tier and -n response variants as matching the routed model', () => {
  expect(usageModelDetails('gemini-3.8-flash-high', '', 'gemini-3.8-flash')).toMatchObject({
    mismatch: false,
    showResponseInTooltip: true,
    effort: 'high',
  });
  expect(usageModelDetails('gemini-3.8-flash-high', 'gemini-3.8-flash-high-low', 'gemini-3.8-flash-n', '')).toMatchObject({
    mismatch: false,
    showResponseInTooltip: true,
    effort: 'low',
  });
  expect(usageModelDetails('gemini-3.8-flash-high', 'gemini-3.8-flash-high-medium', 'gemini-3.8-flash-n', '')).toMatchObject({
    mismatch: false,
    effort: 'medium',
  });
});

test('preserves explicit reasoning_effort and leaves missing effort empty when no alias/model tier suffix exists', () => {
  expect(usageModelDetails('gpt-4o', '', 'gpt-4o', 'auto')).toMatchObject({ effort: 'auto' });
  expect(usageModelDetails('gpt-4o', '', 'gpt-4o', '')).toMatchObject({ effort: '' });
});
