"use client";

import { useState } from "react";
import { NeoButton } from "./neo-button";
import { NeoInput } from "./neo-input";
import type { Tenant, TenantUser, TenantUnit } from "@/lib/tenant-service";

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onRefresh: () => void;
}

export default function TenantTable({ tenants, onEdit, onDelete, onRefresh }: TenantTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter tenants
  const filteredTenants = tenants.filter((tenant) => {
    const user = tenant.userId as TenantUser;
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      tenant.phone?.toLowerCase().includes(searchLower) ||
      tenant.identityCard?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-accent text-white",
      inactive: "bg-secondary text-black",
      "moved-out": "bg-muted text-black",
    };

    const labels = {
      active: "Đang thuê",
      inactive: "Tạm ngưng",
      "moved-out": "Đã chuyển đi",
    };

    return (
      <span
        className={`neo-border px-3 py-1 text-xs font-bold uppercase ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="neo-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <NeoInput
              placeholder="Tìm theo tên, email, SĐT, CMND..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="neo-input px-4 py-3 bg-input border-border text-sm font-bold uppercase"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang thuê</option>
              <option value="inactive">Tạm ngưng</option>
              <option value="moved-out">Đã chuyển đi</option>
            </select>

            <NeoButton variant="secondary" size="sm" onClick={onRefresh}>
              🔄 Làm mới
            </NeoButton>
          </div>
        </div>

        <div className="mt-4 text-sm font-bold text-muted-foreground">
          Tìm thấy <span className="text-foreground">{filteredTenants.length}</span> khách thuê
        </div>
      </div>

      {/* Table */}
      <div className="neo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-black bg-muted">
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Khách thuê
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                  CMND/CCCD
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Phòng hiện tại
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="text-muted-foreground">
                      <p className="text-4xl mb-2">🏠</p>
                      <p className="font-bold text-lg">Không tìm thấy khách thuê</p>
                      <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const user = tenant.userId as TenantUser;
                  const unit = tenant.currentUnit as TenantUnit | null;

                  return (
                    <tr
                      key={tenant._id}
                      className="border-b-3 border-black hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-sm">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-bold">{tenant.identityCard}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm">{tenant.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        {unit ? (
                          <div>
                            <p className="font-bold text-sm">
                              Phòng {unit.unitNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tòa {unit.building} - Tầng {unit.floor}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Chưa có phòng</span>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(tenant.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(tenant)}
                            className="neo-button bg-primary text-primary-foreground px-3 py-1 text-xs"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDelete(tenant)}
                            className="neo-button bg-destructive text-destructive-foreground px-3 py-1 text-xs"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
