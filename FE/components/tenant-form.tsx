"use client";

import { useState, useEffect } from "react";
import { NeoButton } from "./neo-button";
import { NeoInput } from "./neo-input";
import { NeoCard } from "./neo-card";
import type { Tenant, CreateTenantRequest, UpdateTenantRequest, TenantUnit } from "@/lib/tenant-service";
import { getAvailableUnits } from "@/lib/tenant-service";

interface TenantFormProps {
  tenant?: Tenant | null;
  onSubmit: (data: CreateTenantRequest | UpdateTenantRequest) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export default function TenantForm({ tenant, onSubmit, onCancel, isOpen }: TenantFormProps) {
  const isEditMode = !!tenant;

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    identityCard: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    currentUnit: "",
    moveInDate: "",
    moveOutDate: "",
    status: "active" as "active" | "inactive" | "moved-out",
  });

  const [availableUnits, setAvailableUnits] = useState<TenantUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available units
  useEffect(() => {
    if (isOpen) {
      loadAvailableUnits();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (tenant && isOpen) {
      setFormData({
        userId: typeof tenant.userId === "object" ? tenant.userId._id : tenant.userId,
        identityCard: tenant.identityCard || "",
        phone: tenant.phone || "",
        emergencyContactName: tenant.emergencyContact?.name || "",
        emergencyContactPhone: tenant.emergencyContact?.phone || "",
        currentUnit: typeof tenant.currentUnit === "object" && tenant.currentUnit ? tenant.currentUnit._id : (tenant.currentUnit || ""),
        moveInDate: tenant.moveInDate ? new Date(tenant.moveInDate).toISOString().split("T")[0] : "",
        moveOutDate: tenant.moveOutDate ? new Date(tenant.moveOutDate).toISOString().split("T")[0] : "",
        status: tenant.status,
      });
    } else if (!tenant) {
      // Reset form for create mode
      setFormData({
        userId: "",
        identityCard: "",
        phone: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        currentUnit: "",
        moveInDate: "",
        moveOutDate: "",
        status: "active",
      });
    }
  }, [tenant, isOpen]);

  const loadAvailableUnits = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
      const units = await getAvailableUnits(token);
      setAvailableUnits(units);
    } catch (error) {
      console.error("Failed to load units:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode && !formData.userId.trim()) {
      newErrors.userId = "User ID là bắt buộc";
    }

    if (!formData.identityCard.trim()) {
      newErrors.identityCard = "CMND/CCCD là bắt buộc";
    } else if (!/^\d{9,12}$/.test(formData.identityCard)) {
      newErrors.identityCard = "CMND/CCCD phải là 9-12 chữ số";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const emergencyContact = formData.emergencyContactName || formData.emergencyContactPhone
        ? {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
          }
        : undefined;

      if (isEditMode) {
        // Update mode
        const updates: UpdateTenantRequest = {
          identityCard: formData.identityCard,
          phone: formData.phone,
          emergencyContact,
          currentUnit: formData.currentUnit || null,
          moveInDate: formData.moveInDate || null,
          moveOutDate: formData.moveOutDate || null,
          status: formData.status,
        };
        await onSubmit(updates);
      } else {
        // Create mode
        const createData: CreateTenantRequest = {
          userId: formData.userId,
          identityCard: formData.identityCard,
          phone: formData.phone,
          emergencyContact,
          currentUnit: formData.currentUnit || undefined,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error("Form submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <NeoCard className="max-w-2xl w-full my-8 animate-bounce-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {isEditMode ? "✏️ Sửa Khách Thuê" : "➕ Thêm Khách Thuê"}
          </h2>
          <button
            onClick={onCancel}
            className="neo-button bg-muted text-foreground px-3 py-2 text-xl"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID - Only show in create mode */}
          {!isEditMode && (
            <NeoInput
              label="User ID (ObjectId) *"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              error={errors.userId}
              placeholder="64a1b2c3d4e5f6789abcdef0"
              helperText="MongoDB ObjectId của user đã tạo"
            />
          )}

          {/* Identity Card */}
          <NeoInput
            label="CMND/CCCD *"
            name="identityCard"
            value={formData.identityCard}
            onChange={handleChange}
            error={errors.identityCard}
            placeholder="0123456789"
            disabled={isEditMode}
            helperText={isEditMode ? "Không thể sửa CMND/CCCD" : "9-12 chữ số"}
          />

          {/* Phone */}
          <NeoInput
            label="Số điện thoại *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="0901234567"
          />

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeoInput
              label="Liên hệ khẩn cấp - Tên"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
            />
            <NeoInput
              label="Liên hệ khẩn cấp - SĐT"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="0987654321"
            />
          </div>

          {/* Current Unit */}
          <div>
            <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wider">
              Phòng hiện tại
            </label>
            <select
              name="currentUnit"
              value={formData.currentUnit}
              onChange={handleChange}
              className="neo-input w-full px-4 py-3 bg-input text-foreground text-sm md:text-base"
            >
              <option value="">-- Chọn phòng --</option>
              {availableUnits.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  Phòng {unit.unitNumber} - Tòa {unit.building} - Tầng {unit.floor}
                </option>
              ))}
            </select>
          </div>

          {/* Move In/Out Dates */}
          {isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeoInput
                label="Ngày chuyển vào"
                name="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={handleChange}
              />
              <NeoInput
                label="Ngày chuyển đi"
                name="moveOutDate"
                type="date"
                value={formData.moveOutDate}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Status - Only show in edit mode */}
          {isEditMode && (
            <div>
              <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wider">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="neo-input w-full px-4 py-3 bg-input text-foreground text-sm md:text-base"
              >
                <option value="active">Đang thuê</option>
                <option value="inactive">Tạm ngưng</option>
                <option value="moved-out">Đã chuyển đi</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <NeoButton type="submit" variant="primary" size="md" loading={loading} className="flex-1">
              {isEditMode ? "💾 Lưu thay đổi" : "➕ Tạo khách thuê"}
            </NeoButton>
            <NeoButton type="button" variant="secondary" size="md" onClick={onCancel} className="flex-1">
              ❌ Hủy
            </NeoButton>
          </div>
        </form>
      </NeoCard>
    </div>
  );
}
