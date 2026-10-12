import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { UserDetail, Role } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, UserCheck, UserX, Shield, Briefcase, User as UserIcon, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Status toggle modal state
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchUsers = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(
        roleFilter || undefined,
        search.trim() || undefined,
        page,
        10
      );
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setCurrentPage(res.page);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(0);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    const newStatus = !selectedUser.isActive;
    try {
      await adminService.updateUserStatus(selectedUser.id, newStatus, actionReason);
      toast.success(
        `User ${selectedUser.fullName} has been ${newStatus ? 'activated' : 'deactivated'}`
      );
      setSelectedUser(null);
      setActionReason('');
      fetchUsers(currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'RECRUITER':
        return 'warning';
      case 'CANDIDATE':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 mr-1 inline" />;
      case 'RECRUITER':
        return <Briefcase className="w-3.5 h-3.5 mr-1 inline" />;
      case 'CANDIDATE':
        return <UserIcon className="w-3.5 h-3.5 mr-1 inline" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">User Governance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform members, assign role permissions, and handle account compliance.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Users: <span className="font-bold text-navy-900">{totalElements}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email address..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Roles</option>
              <option value="CANDIDATE">Candidates</option>
              <option value="RECRUITER">Recruiters</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No users matched your search criteria or role filters."
            icon="search"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3.5">User Details</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Activity Stats</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900">{u.fullName || 'No Name Set'}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                        {getRoleIcon(u.role)}
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {u.role === 'CANDIDATE' && (
                        <span>
                          <strong className="text-navy-900">{u.applicationCount || 0}</strong> Applications
                        </span>
                      )}
                      {u.role === 'RECRUITER' && (
                        <span>
                          <strong className="text-navy-900">{u.jobPostingCount || 0}</strong> Job Postings
                        </span>
                      )}
                      {u.role === 'ADMIN' && (
                        <span className="text-slate-400">System Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                        {u.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button
                        variant={u.isActive ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setActionReason('');
                        }}
                        className={u.isActive ? 'text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300' : ''}
                      >
                        {u.isActive ? (
                          <>
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={10}
              onPageChange={(page) => fetchUsers(page)}
            />
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      {selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={selectedUser.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to{' '}
              <strong className={selectedUser.isActive ? 'text-rose-600' : 'text-emerald-600'}>
                {selectedUser.isActive ? 'suspend' : 'reactivate'}
              </strong>{' '}
              the account for <strong>{selectedUser.fullName}</strong> ({selectedUser.email})?
            </p>
            {selectedUser.isActive && (
              <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded border border-rose-200">
                Suspending this user will immediately revoke their ability to log in and access portal features.
              </p>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Internal Notes (Optional)
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Inactive recruiter, suspicious activity, request from candidate..."
                rows={3}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="md" onClick={() => setSelectedUser(null)} disabled={updating}>
                Cancel
              </Button>
              <Button
                variant={selectedUser.isActive ? 'danger' : 'primary'}
                size="md"
                onClick={handleToggleStatus}
                isLoading={updating}
              >
                Confirm {selectedUser.isActive ? 'Suspension' : 'Activation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
