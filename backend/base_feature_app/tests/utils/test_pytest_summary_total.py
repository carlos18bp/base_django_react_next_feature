from __future__ import annotations

import importlib.util
import json
import sys
import types
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[4]
CONFTEST_PATH = REPO_ROOT / "backend" / "conftest.py"

spec = importlib.util.spec_from_file_location("backend_conftest", CONFTEST_PATH)
assert spec is not None
assert spec.loader is not None
backend_conftest = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = backend_conftest
spec.loader.exec_module(backend_conftest)

_REPORT_PAYLOAD = {
    "totals": {
        "num_statements": 10,
        "missing_lines": 2,
        "covered_lines": 8,
        "percent_covered": 80.0,
        "num_lines": 10,
        "num_branches": 4,
        "missing_branches": 1,
        "covered_branches": 3,
    },
    "files": {
        "sample.py": {
            "summary": {
                "num_statements": 10,
                "missing_lines": 2,
                "percent_covered": 80.0,
            }
        }
    },
}


def _make_fake_coverage(report_payload):
    """Return a fake coverage module whose Coverage class writes *report_payload*."""

    class FakeCoverageData:
        def lines(self, filename):
            if str(filename).endswith("sample.py"):
                return [2]
            return []

    class FakeCoverage:
        def __init__(self, data_file):
            self.data_file = data_file

        def load(self):
            return None

        def json_report(self, outfile, omit, ignore_errors):
            Path(outfile).write_text(json.dumps(report_payload), encoding="utf-8")

        def get_data(self):
            return FakeCoverageData()

    mod = types.ModuleType("coverage")
    mod.Coverage = FakeCoverage
    return mod


@pytest.fixture
def summary_output(tmp_path, monkeypatch):
    """Run pytest_terminal_summary with a fake coverage backend, return captured output lines."""
    coverage_file = tmp_path / ".coverage"
    coverage_file.write_text("data", encoding="utf-8")

    sample_path = tmp_path / "sample.py"
    sample_path.write_text("def alpha():\n    return 1\n\ndef beta():\n    return 2\n", encoding="utf-8")

    monkeypatch.setitem(sys.modules, "coverage", _make_fake_coverage(_REPORT_PAYLOAD))

    output: list[str] = []

    class FakeTerminalReporter:
        def write_sep(self, sep, title=None, **_kwargs):
            output.append(f"{sep}{title}")

        def write_line(self, message):
            output.append(message)

    class FakeConfig:
        rootdir = tmp_path

    backend_conftest.pytest_terminal_summary(FakeTerminalReporter(), 0, FakeConfig())
    return output


def test_pytest_summary_emits_one_combined_total_line(summary_output):
    """The summary contains exactly one TOTAL (combined) line."""
    combined_lines = [line for line in summary_output if "TOTAL (combined)" in line]
    assert len(combined_lines) == 1


def test_pytest_summary_combined_total_shows_statement_count(summary_output):
    """The combined total line includes the merged statement count '26'."""
    combined_line = next(l for l in summary_output if "TOTAL (combined)" in l)
    assert "26" in combined_line


def test_pytest_summary_combined_total_shows_miss_count(summary_output):
    """The combined total line includes the merged miss count '6'."""
    combined_line = next(l for l in summary_output if "TOTAL (combined)" in l)
    assert "6" in combined_line


def test_pytest_summary_combined_total_shows_percent(summary_output):
    """The combined total line includes the computed percent '76.9%'."""
    combined_line = next(l for l in summary_output if "TOTAL (combined)" in l)
    assert "76.9%" in combined_line
