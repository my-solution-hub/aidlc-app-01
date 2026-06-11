/**
 * Backend unified response wrapper.
 * All backend APIs return this structure through the gateway.
 */
export interface Result<T = unknown> {
  code: string | number;
  message: string;
  success?: boolean;
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
  employeeId?: string;
  role?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  nickname: string;
  role: string;
  status: string;
  employeeId?: string;
  department?: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStatsDTO {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
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
  department?: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  role?: string;
  employeeId?: string;
  department?: string;
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
  images?: string[];
  subtitle: string;
  deliveryMethod: string;
  serviceGuarantee: string;
  promotion: string;
  colors: string;
  specs: Record<string, string>[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStatsDTO {
  totalProducts: number;
  onSaleProducts: number;
}

export interface ListProductRequest {
  page?: number;
  size?: number;
  name?: string;
  category?: string;
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
  images?: string[];
  subtitle?: string;
  deliveryMethod?: string;
  serviceGuarantee?: string;
  promotion?: string;
  colors?: string;
  specs?: Record<string, string>[];
}

export interface StockAdjustRequest {
  changeType: "IN" | "OUT";
  quantity: number;
  reason?: string;
}

// ---- Product Review (C5) ----

export interface ReviewDTO {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  content: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: number;
  userId: number;
  rating: number;
  content: string;
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
  scope?: string;
  grantMethod?: string;
  icon?: string;
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
  scope?: string;
  grantMethod?: string;
  icon?: string;
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
  operator?: string;
  createdAt: string;
}

export interface ListPointTransactionRequest {
  userId: number;
  page?: number;
  size?: number;
  type?: string;
}

// ---- Exchange Record ----

/** One entry of an order's status timeline (B3). */
export interface StatusLogDTO {
  status: string;
  remark: string;
  time: string;
}

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
  // ---- Extended fields (B2/B4): present on detail responses ----
  freightPoints?: number;
  balanceAfter?: number;
  carrier?: string;
  receiver?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  timeline?: StatusLogDTO[];
}

export interface UpdateExchangeRecordStatusRequest {
  id: number;
  status: string;
  trackingNumber?: string;
  carrier?: string;
}

// ---- Order (employee) ----

export interface ExchangeRequest {
  productId: number;
  quantity: number;
  userId: number;
  employeeName?: string;
  addressId?: number;
}

// ---- Shipping Address (C1) ----

export interface AddressDTO {
  id: number;
  userId: number;
  receiver: string;
  phone: string;
  region: string;
  detail: string;
  postalCode?: string;
  isDefault: number;
  createdAt?: string;
}

export interface SaveAddressRequest {
  id?: number;
  userId: number;
  receiver: string;
  phone: string;
  region: string;
  detail: string;
  postalCode?: string;
  isDefault?: number;
}

export interface ListOrderRequest {
  userId: number;
  page?: number;
  size?: number;
  status?: string;
  keyword?: string;
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

// ---- Point Admin (employee points management, US-020/021/022) ----

export interface UserPointDTO {
  userId: number;
  username: string;
  nickname: string;
  employeeNo: string;
  balance: number;
  totalEarned: number;
  totalUsed: number;
  updatedAt: string;
}

export interface ListUserPointRequest {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface AdminAdjustPointRequest {
  userId: number;
  amount: number;
  reason: string;
}

export interface DistributionConfigDTO {
  amount: number;
  cycle: string;
  grantDay: number;
  enabled: boolean;
  targetRole: string;
  updatedAt: string;
}

export interface UpdateDistributionConfigRequest {
  amount: number;
  cycle?: string;
  grantDay?: number;
  enabled?: boolean;
  targetRole?: string;
}

export interface PointGrantStatsDTO {
  month: string;
  grantedTotal: number;
  coveredEmployees: number;
  lastGrantedAt: string;
}
