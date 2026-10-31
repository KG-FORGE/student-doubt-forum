import { useState, useEffect, useCallback } from 'react';
import Container from '../../components/common/Container.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import * as adminService from '../../services/adminService.js';
import {
  Users,
  AlertTriangle,
  BookOpen,
  Megaphone,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'reports' | 'subjects' | 'announcements' | 'audit'

  // Platform stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users tab
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Moderation / Reports tab
  const [reports, setReports] = useState([]);
  const [reportStatusFilter, setReportStatusFilter] = useState('pending');
  const [reportsLoading, setReportsLoading] = useState(false);

  // Subjects tab
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Announcements tab
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // Audit logs tab
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [actionMessage, setActionMessage] = useState('');

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminService.getStats();
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = {};
      if (userSearch.trim()) params.search = userSearch.trim();
      if (userRoleFilter) params.role = userRoleFilter;
      const res = await adminService.getUsers(params);
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error('Users error:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, userRoleFilter]);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await adminService.getReports({ status: reportStatusFilter });
      setReports(res.data.data.reports || []);
    } catch (err) {
      console.error('Reports error:', err);
    } finally {
      setReportsLoading(false);
    }
  }, [reportStatusFilter]);

  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    try {
      const res = await adminService.getAdminSubjects();
      setSubjects(res.data.data.subjects || []);
    } catch (err) {
      console.error('Subjects error:', err);
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await adminService.getAnnouncements();
      setAnnouncements(res.data.data.announcements || []);
    } catch (err) {
      console.error('Announcements error:', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await adminService.getAuditLogs({ limit: 40 });
      setAuditLogs(res.data.data.logs || []);
    } catch (err) {
      console.error('Audit logs error:', err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'subjects') loadSubjects();
    if (activeTab === 'announcements') loadAnnouncements();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, loadUsers, loadReports, loadSubjects, loadAnnouncements, loadAuditLogs]);

  // Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      setActionMessage(`Role updated to ${newRole}`);
      setTimeout(() => setActionMessage(''), 3000);
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Role change failed');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const reason =
      newStatus === 'suspended'
        ? prompt('Reason for suspension (optional):') || 'Suspended by admin'
        : '';
    try {
      await adminService.updateUserStatus(userId, newStatus, reason);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)),
      );
      setActionMessage(`Account marked as ${newStatus}`);
      setTimeout(() => setActionMessage(''), 3000);
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Status change failed');
    }
  };

  const handleResolveReport = async (reportId, status, actionTaken = 'none') => {
    try {
      await adminService.resolveReport(reportId, {
        status,
        actionTaken,
        moderatorNote: actionTaken === 'remove_content' ? 'Content removed' : 'Dismissed',
      });
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      setActionMessage(`Report marked as ${status}`);
      setTimeout(() => setActionMessage(''), 3000);
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const res = await adminService.createSubject({
        name: newSubjectName.trim(),
        description: newSubjectDesc.trim(),
      });
      setSubjects((prev) => [...prev, res.data.data.subject]);
      setNewSubjectName('');
      setNewSubjectDesc('');
      setActionMessage('Subject created successfully');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;
    try {
      const res = await adminService.createAnnouncement({
        title: newAnnouncementTitle.trim(),
        content: newAnnouncementContent.trim(),
        isPublished: true,
      });
      setAnnouncements((prev) => [res.data.data.announcement, ...prev]);
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      setActionMessage('Announcement published');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Console
            </h1>
            <Badge variant="admin">Administrator</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Platform management, user roles, content moderation, and security auditing.
          </p>
        </div>

        {actionMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 animate-fade-in">
            ✓ {actionMessage}
          </div>
        )}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          Overview & Stats
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          User Management
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Content Moderation
          {stats?.moderation?.pendingReports > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {stats.moderation.pendingReports}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Subjects
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Announcements
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          Audit Logs
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {statsLoading ? (
              <LoadingSpinner text="Computing platform metrics..." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-5 border border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.users?.total ?? 0}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {stats?.users?.students ?? 0} students • {stats?.users?.teachers ?? 0} teachers • {stats?.users?.admins ?? 0} admins
                  </p>
                </Card>

                <Card className="p-5 border border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Questions</span>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{stats?.questions?.total ?? 0}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {stats?.questions?.open ?? 0} open discussions
                  </p>
                </Card>

                <Card className="p-5 border border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Solutions</span>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">{stats?.questions?.verified ?? 0}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {stats?.answers?.verified ?? 0} answers verified by teachers
                  </p>
                </Card>

                <Card className="p-5 border border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Reports</span>
                  <p className="mt-2 text-3xl font-bold text-rose-600">{stats?.moderation?.pendingReports ?? 0}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Awaiting moderator review
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Registered Users</h3>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Input
                  name="userSearch"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="text-xs py-1.5"
                />

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {usersLoading ? (
              <LoadingSpinner text="Loading users..." />
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Reputation</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-900">
                          <div>{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold capitalize text-slate-700"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-amber-700">★ {u.reputation ?? 0}</td>
                        <td className="p-3 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          {u.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(u._id, 'suspended')}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(u._id, 'active')}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Moderation / Reports Tab */}
        {activeTab === 'reports' && (
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Content Moderation Queue</h3>
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="pending">Pending Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {reportsLoading ? (
              <LoadingSpinner text="Loading reports..." />
            ) : reports.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">
                No {reportStatusFilter} reports in the moderation queue.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {reports.map((r) => (
                  <div key={r._id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger">{r.reason}</Badge>
                        <span className="font-semibold text-slate-700">
                          Reported {r.targetType} by {r.reporter?.name} ({r.reporter?.email})
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {r.description && (
                      <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded">
                        Note: "{r.description}"
                      </p>
                    )}

                    {r.targetItem && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs">
                        <p className="font-semibold text-slate-800">
                          Reported Content ({r.targetItem.status}):
                        </p>
                        <p className="mt-1 text-slate-700">
                          {r.targetItem.title || r.targetItem.content}
                        </p>
                      </div>
                    )}

                    {r.status === 'pending' && (
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleResolveReport(r._id, 'dismissed')}
                          className="flex items-center gap-1 rounded px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Dismiss Report
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolveReport(r._id, 'resolved', 'remove_content')}
                          className="flex items-center gap-1 rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Remove Content & Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-slate-200 md:col-span-1">
              <h3 className="text-base font-bold text-slate-900 mb-4">Add Course / Subject</h3>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <Input
                  label="Subject Name"
                  name="subjectName"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  required
                />
                <Input
                  label="Description"
                  name="subjectDesc"
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="Course description..."
                />
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-1 inline" />
                  Add Subject
                </Button>
              </form>
            </Card>

            <Card className="p-6 border border-slate-200 md:col-span-2">
              <h3 className="text-base font-bold text-slate-900 mb-4">Configured Subjects</h3>
              {subjectsLoading ? (
                <LoadingSpinner text="Loading subjects..." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-slate-500">{s.description || 'No description'}</p>
                      </div>
                      <Badge variant={s.isActive ? 'success' : 'default'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-slate-200 md:col-span-1">
              <h3 className="text-base font-bold text-slate-900 mb-4">Broadcast Announcement</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <Input
                  label="Title"
                  name="announcementTitle"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Midterm doubt sessions schedule"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Announcement Body
                  </label>
                  <textarea
                    rows={4}
                    value={newAnnouncementContent}
                    onChange={(e) => setNewAnnouncementContent(e.target.value)}
                    placeholder="Details for all platform members..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Publish Announcement
                </Button>
              </form>
            </Card>

            <Card className="p-6 border border-slate-200 md:col-span-2">
              <h3 className="text-base font-bold text-slate-900 mb-4">Published Announcements</h3>
              {announcementsLoading ? (
                <LoadingSpinner text="Loading announcements..." />
              ) : announcements.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No announcements broadcast yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {announcements.map((a) => (
                    <div key={a._id} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{a.title}</span>
                        <span className="text-slate-400">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 whitespace-pre-line">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <Card className="p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Security & Moderation Audit Trail</h3>
            {auditLoading ? (
              <LoadingSpinner text="Retrieving immutable audit records..." />
            ) : auditLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No administrative events recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500 font-sans">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 font-medium text-slate-800 font-sans">
                          {log.actor?.name} ({log.actor?.email})
                        </td>
                        <td className="p-3">
                          <Badge variant="primary">{log.action}</Badge>
                        </td>
                        <td className="p-3 text-slate-600">
                          {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                        </td>
                        <td className="p-3 text-slate-500 truncate max-w-xs">
                          {JSON.stringify(log.metadata)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </Container>
  );
}

export default AdminDashboard;
