/**
 * Backend unified response wrapper.
 * All backend APIs return this structure through the gateway.
 */
export interface Result<T = unknown> {
  code: string;
  message: string;
  data: T;
}

/**
 * Backend paginated response.
 */
export interface PageResult<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

// ---- Auth ----

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  nickname: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname?: string;
  role?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  nickname: string;
  role: string;
  status: string;
  employeeId?: string;
  lastLoginAt: string;
  createdAt: string;
}

export interface ListUserRequest {
  page?: number;
  size?: number;
  username?: string;
  role?: string;
  status?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nickname: string;
  role: string;
  employeeId?: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  role?: string;
  employeeId?: string;
}

// ---- Product ----

export interface ProductDTO {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  pointsPrice: number;
  marketPrice: number;
  stock: number;
  soldCount: number;
  status: number;
  description: string;
  imageUrl: string;
  subtitle: string;
  deliveryMethod: string;
  serviceGuarantee: string;
  promotion: string;
  colors: string;
  specs: Record<string, string>[];
  createdAt: string;
  updatedAt: string;
}

export interface ListProductRequest {
  page?: number;
  size?: number;
  name?: string;
  category?: string;
  /** Sort field: "soldCount" | "pointsPrice" | "createdAt" */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "ASC" | "DESC";
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  brand?: string;
  pointsPrice: number;
  marketPrice?: number;
  stock?: number;
  status?: number;
  description?: string;
  imageUrl?: string;
  subtitle?: string;
  deliveryMethod?: string;
  serviceGuarantee?: string;
  promotion?: string;
  colors?: string;
  specs?: Record<string, string>[];
}

// ---- Category ----

export interface CategoryDTO {
  id: number;
  name: string;
  parentId: number | null;
  icon: string;
  sortOrder: number;
  status: number;
  description: string;
  productCount: number;
  children: CategoryDTO[];
}

export interface ListCategoryRequest {
  name?: string;
  status?: number;
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  status?: number;
  description?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number;
}

// ---- Point Rule ----

export interface PointRuleDTO {
  id: number;
  name: string;
  description: string;
  ruleType: string;
  pointValueMin: number;
  pointValueMax: number;
  triggerCondition: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListPointRuleRequest {
  page?: number;
  size?: number;
  name?: string;
  ruleType?: string;
  status?: number;
}

export interface CreatePointRuleRequest {
  name: string;
  description?: string;
  ruleType: string;
  pointValueMin: number;
  pointValueMax: number;
  triggerCondition?: string;
  status?: number;
}

export interface UpdatePointRuleRequest extends CreatePointRuleRequest {
  id: number;
}

// ---- Point Balance / Transaction ----

export interface PointBalanceDTO {
  userId: number;
  balance: number;
  totalEarned: number;
  totalUsed: number;
}

export interface PointTransactionDTO {
  id: number;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface ListPointTransactionRequest {
  userId: number;
  page?: number;
  size?: number;
  type?: string;
}

// ---- Exchange Record ----

export interface ExchangeRecordDTO {
  id: number;
  orderNo: string;
  productName: string;
  productDesc: string;
  productImageUrl?: string;
  userId?: number;
  quantity?: number;
  employeeName: string;
  pointsCost: number;
  exchangeTime: string;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateExchangeRecordStatusRequest {
  id: number;
  status: string;
  trackingNumber?: string;
}

// ---- Order (employee) ----

export interface ExchangeRequest {
  productId: number;
  quantity: number;
  userId: number;
  employeeName?: string;
}

export interface ListOrderRequest {
  userId: number;
  page?: number;
  size?: number;
  status?: string;
}

export interface ExchangeRecordStatsDTO {
  totalCount: number;
  pendingDeliveryCount: number;
  completedCount: number;
  totalPointsConsumed: number;
}

export interface ListExchangeRecordRequest {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

// ---- File ----

export interface UploadResultDTO {
  filename: string;
  url: string;
}
