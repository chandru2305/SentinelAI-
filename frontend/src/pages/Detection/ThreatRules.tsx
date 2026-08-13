import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { threatService, ThreatRule } from '../../services/threatService';

const columns = ['Rule Name', 'Category', 'Severity', 'MITRE', 'Enabled'];

const ThreatRules = () => {
  const [rules, setRules] = useState<ThreatRule[]>([]);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    threatService.getRules().then(setRules).catch(console.error);
  }, []);

  const filtered = useMemo(
    () => rules.filter((rule) => {
      const matchesFilter = rule.rule_name.toLowerCase().includes(filter.toLowerCase()) || rule.category.toLowerCase().includes(filter.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter;
      return matchesFilter && matchesSeverity;
    }),
    [filter, rules, severityFilter],
  );

  return (
    <div className="page-shell">
      <PageHeader title="Threat Rules" />
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Rule Catalog</div>
        </div>
        <div className="section-card-body">
          <div className="table-tools-row">
            <input
              className="form-input"
              placeholder="Search rules..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <select className="form-select" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="table-scroll-wrapper">
            <table className="threat-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rule) => (
                  <tr key={rule.rule_name}>
                    <td>{rule.rule_name}</td>
                    <td>{rule.category}</td>
                    <td><span className={`badge ${rule.severity}`}>{rule.severity}</span></td>
                    <td>{rule.mitre.technique_id}</td>
                    <td>{rule.enabled ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-empty-cell">No threat rules matched.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatRules;
