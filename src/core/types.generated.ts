// Auto-generated from OpenAPI spec — do not edit manually
// Run: pnpm generate

// ── Response Types ──────────────────────────────────────────────────

export interface API {
  description: string
  from: string
  login: string
  name: string
  repo: string
  signup: string
  type: string
  url: string
}

export interface APIDefinition {
  account?: string
  author?: string
  build?: string
  description?: string
  docs?: string
  endpoints?: Record<string, string>
  from?: string
  icon?: string
  license?: string
  login?: string
  name?: string
  prices?: Record<string, string>
  repo?: string
  resources?: Record<string, string>
  signup?: string
  site?: string
  subscribe?: string
  type?: 'data'
  updated?: string
  url?: string | string
  version?: string
}

export interface APRResponse {
  apr: Record<string, number>
  creditScore: string
  vehicle: {
    make: string
    model: string
    vin: string
    year: number
  }
  vehicleAge: number
  vehicleMileage: number
  zip: string
}

export interface Accept {
  name: string
  q?: number
  subtype: string
  suffix?: string
  type: string
}

export interface AcceptLanguage {
  extendedLanguageSubtags: unknown[]
  extensions: unknown[]
  irregular: null
  language: string
  privateuse: unknown[]
  q?: number
  region: null | string
  regular: null
  script: null
  variants: unknown[]
}

/** API to search & view photos for any vehicle. */
export interface AllPhotosResponse {
  data: {
    /** Retail Photos */
    retail?: string[]
    wholesale?: string[]
  }
  /** Last seen listed: when a source last listed the vehicle, in UTC ("YYYY-MM-DD HH:MM:SS", as `createdAt`). Only on an answer from stored photos for a vehicle with no current listing; it left the market within 48 hours after. */
  removedAt?: string
}

export interface ApiUser {
  accessState?: 'active' | 'suspended'
  admin?: boolean
  authenticated: boolean
  browser?: string
  city: string
  continent: string
  country: string
  edgeDistanceKilometers?: number
  edgeDistanceMiles?: number
  edgeLocation: string
  email?: string
  enterprise?: boolean
  flag: string
  image?: string
  ip: string
  isp: string
  latencyMilliseconds: number
  localTime: string
  metro: string
  name?: string
  org?: string
  os: string
  plan: 'Free' | 'Starter' | 'Growth' | 'Scale' | 'Enterprise'
  recentInteractions: number
  region: string
  requestId: string
  serviceLatency?: number
  spendCap?: number
  support?: string
  timezone: string
  trustScore: number
  upgrade?: string
  userAgent?: string
  zipcode?: string
}

export interface BehaviorType {
  code: string
  id: number
}

export interface BotManagement {
  corporateProxy: boolean
  detectionIDS: Query
  jsDetection: JSDetection
  score: number
  staticResource: boolean
  verifiedBot: boolean
}

export interface Browser {
  major: string
  name: string
  version: string
}

export interface Build {
  confidence: number
  drivetrain: string
  engine: string
  exteriorColor: Record<string, string>
  exteriorColorCode?: string
  interiorColor: Record<string, string>
  /** Manufacturer paint / trim codes beside the color names, when the bought row carries them (apis#670). */
  interiorColorCode?: string
  make: string
  model: string
  options: Record<string, string>
  /** The equipment group / package code (e.g. 302A), when the bought row carries one (apis#670). */
  packageCode?: string
  series: string
  style: string
  transmission: string
  trim: string
  vin: string
  year: number
}

export interface BuildAPI {
  description: string
  login: string
  name: string
  repo: string
  signup: string
  url: string
}

export interface BuildBuild {
  confidence: number
  drivetrain: string
  engine: string
  exteriorColor: ExteriorColor
  interiorColor: InteriorColor
  make: string
  model: string
  options: Options
  series: string
  style: string
  transmission: string
  trim: string
  vin: string
  year: number
}

export interface BuildResponse {
  build: Build
}

export interface BuyResponse {
  actions: BuyResponseActions
  build: BuyResponseBuild
  checklist: Checklist
  creditScore: string
  historicalListings: HistoricalListing[]
  listing: Listing
  listingID: string
  miles: number
  payments: Payments
  price: number
  rates: BuyResponseRates
  shipping: Shipping
  vin: string
  vsc: Vsc
  zip: string
}

export interface BuyResponseAPI {
  by: string
  description: string
  docs: string
  icon: string
  login: string
  name: string
  url: string
}

export interface BuyResponseActions {
  changeBuyerZipCode: string
  changeDownPayment: string
  changeLoanTerm: string
  changeProtectionPlan: string
  getTradeInOffer: string
}

export interface BuyResponseBuild {
  build: BuildBuild
}

export interface BuyResponseRates {
  terms: Record<string, RatesTerm[]>
}

export interface CF {
  asOrganization: string
  asn: number
  botManagement: BotManagement
  city: string
  clientAcceptEncoding: string
  clientTCPRtt: number
  colo: string
  continent: string
  country: string
  edgeRequestKeepAliveStatus: number
  httpProtocol: string
  latitude: string
  longitude: string
  postalCode: string
  region: string
  regionCode: string
  requestPriority: string
  timezone: string
  tlsCipher: string
  tlsClientAuth: TLSClientAuth
  tlsClientExtensionsSha1: string
  tlsClientHelloLength: string
  tlsClientRandom: string
  tlsExportedAuthenticator: TLSExportedAuthenticator
  tlsVersion: string
  verifiedBotCategory: string
}

export interface CPU {
  architecture: string
}

export interface CalculationCriteria {
  applyLimits: boolean
  conditionalIncentiveAmount: number
  docFee: number
  downPayment: number
  financeRate: number
  lowerLimit: boolean
  marketValue: number
  msrp: number
  numberOfMonths: number
  primaryIncentiveAmount: number
  salesPrice: number
  styleID: number
  tradeIn: number
  tradeInOwedAmount: number
  withConcreteTaxesAndFees: boolean
  zipCode: string
}

export type ChangeTradeInValue = Record<string, string>

export type ChangeZip = Record<string, string>

export interface Checklist {
  authorizeBankAccount: string
  connectInsuranceAccount: string
  drivewayCelebration: string
  eSignBuyersAgreement: string
  getPreApproved: string
  notarizePowerOfAttorney: string
  trackDelivery: string
  uploadDriversLicense: string
}

export type City = string

export interface CityZips {
  chicagoIL: string
  detroitMI: string
  losAngelesCA: string
  miamiFL: string
  minneapolisMN: string
  newYorkNY: string
  seattleWA: string
}

export type Code = string

export interface Colo {
  cca2: string
  city: string
  iata: string
  lat: number
  lon: number
  region: string
}

export interface Color {
  exterior: Terior[]
  interior: Terior[]
}

export interface Component {
  description: ComponentDescription
  lossCodes: LossCode[]
}

export type ComponentDescription = string

export interface CreditScores {
  excellent: number
  fair: number
  good: number
  veryGood: number
}

export interface Criteria {
  docFee: number
  price: number
  tradeIn: number
  zip: string
}

export interface Crossover {
  id: number
  name: string
}

export interface CtxResponse {
  accept: Accept[]
  acceptLanguage: AcceptLanguage[]
  body: string
  cf: CF
  checkDigit: string
  checksum: boolean
  cityZips: CityZips
  colo: Colo
  cookies: null
  creditScores: CreditScores
  data: Data
  emojis: Emojis
  examples: Examples
  glyphs: Glyphs
  hash: string
  headers: Headers
  hostSegments: string[]
  hostname: string
  infrastructure: Infrastructure
  instanceCreated: number
  instanceCreatedBy: string
  instanceDiff: number
  instanceDurationMilliseconds: number
  instanceDurationSeconds: number
  instanceID: string
  instancePrefix: string
  instanceRequests: number
  instanceStart: number
  make: string
  method: string
  model: string
  newInstance: boolean
  origin: string
  pathDefaults: string[]
  pathSegments: string[]
  pathname: string
  query: Query
  rayID: string
  requestID: string
  requestMagicBits: string
  requestMagicPrefix: string
  requestPrefix: string
  requestTimestamp: number
  rootPath: boolean
  search: string
  services: Services
  squishVin: string
  styleId: string
  styleIds: string[]
  subdomains: string[]
  time: string
  ts: number
  ua: Ua
  url: string
  userAgent: string
  vehicle: Vehicle
  vin: string
  vinValid: boolean
  year: string
}

export interface Data {
  bookValuation: string
  historicalPrices: string
  oemBuildData: string
  specifications: string
  totalCostOfOwnership: string
  vehicleHistoryReport: string
  vehicleListings: string
  windowSticker: string
}

export type DataSource = string

export interface Dealer {
  city: City
  country: string
  dealerType: string
  id: number
  latitude: string
  longitude: string
  name: Name
  phone: string
  state: State
  street: string
  website: Source
  zip: string
}

export interface Deductible {
  amount?: number
  description?: DeductibleDescription
  type: DeductibleType
}

export type DeductibleDescription = string

export type DeductibleType = string

export type DmvFees = Record<string, string>

export interface DmvFeesItemized {
  name: string
  value: number
}

export interface DriveTrain {
  centerLimitedSlipDifferential: boolean
  driveType: string
  transmission: string
}

export interface EdmundsTypeCategories {
  crossover: Crossover
  suv: Crossover
}

export type Emojis = Record<string, string>

export interface Endpoints {
  create: string
  preview: string
  quote: string
}

export interface Engine {
  baseEngineSize: string
  baseEngineType: string
  camType: string
  cylinders: string
  directInjection: boolean
  horsepower: string
  torque: string
  valveTiming: string
  valves: string
}

export interface Eta {
  max: number
  min: number
}

export type Examples = Record<string, string>

export type ExteriorColor = Record<string, string>

export interface Extra {
  features: string[]
  highValueFeatures: HighValueFeature[]
  optionsPackages: string[]
}

export interface Fees {
  combinedFees: number
  dmvFee: number
  dmvFees: DmvFees
  docFee: number
  registrationFee: number
  titleFee: number
}

export interface Frontseats {
  bucketFrontSeats: boolean
  driverSeatWithPowerAdjustableLumbarSupport: boolean
  frontHeadRoom: string
  frontHipRoom: string
  frontLegRoom: string
  frontShoulderRoom: string
  heightAdjustableDriverSeat: boolean
  premiumCloth: boolean
  the4WayManualPassengerSeatAdjustment: boolean
  the8WayPowerDriverSeat: boolean
}

export interface Fuel {
  epaCityHighwayMpg: string
  epaCombinedMpg: string
  fuelTankCapacity: string
  fuelType: string
  rangeInMilesCityHwy: string
}

export type Glyphs = Record<string, string>

export interface Headers {
  accept: string
  acceptEncoding: string
  acceptLanguage: string
  cfConnectingIP: string
  cfIpcountry: string
  cfRay: string
  cfVisitor: string
  connection: string
  dnt: string
  host: string
  priority: string
  secFetchDest: string
  secFetchMode: string
  secFetchSite: string
  secFetchUser: string
  secGpc: string
  upgradeInsecureRequests: string
  userAgent: string
  xForwardedProto: string
  xRealIP: string
}

export interface HighValueFeature {
  category: string
  description: string
  type: HighValueFeatureType
}

export type HighValueFeatureType = string

export interface HistoricalListing {
  city: City
  dataSource: DataSource
  firstSeenAt: number
  firstSeenAtDate: string
  id: string
  inventoryType: InventoryType
  lastSeenAt: number
  lastSeenAtDate: string
  miles?: number
  price?: number
  scrapedAt: number
  scrapedAtDate: string
  sellerName: Name
  sellerType: SellerType
  source: Source
  state: State
  statusDate: number
  vdpURL: string
  zip: string
}

export type InCarEntertainment = Record<string, string>

export interface Incentive {
  apr?: number
  aprDescription?: string
  bulletPoints?: string[]
  cashDescription?: string
  conditionalCash?: number
  conditionalDescription?: string
  costPerMile?: number
  disclaimer?: string
  display?: boolean
  dispositionFee?: number
  endDate?: string
  leaseDescription?: string
  make?: string
  manufactName?: string
  model?: string
  msrp?: number
  payment?: number
  per1000?: number
  term?: number
  title?: string
  totalCash?: number
  totalPayments?: number
  type?: string
  vehicle?: {
    make?: string
    model?: string
    year?: string
  }
  webURL?: string
  year?: string
}

export interface Infrastructure {
  authenticate: string
  cryptoHash: string
  keyValueStore: string
}

export interface Instrumentation {
  clock: boolean
  compass: boolean
  externalTemperatureDisplay: boolean
  tachometer: boolean
  tripComputer: boolean
}

export type InteriorColor = Record<string, string>

export type InteriorOptions = Record<string, string>

export type InventoryType = string

export interface JSDetection {
  passed: boolean
}

export interface LimitCriteria {
  limitPercentage: number
  limitPrice: number
  limits: unknown[]
}

export interface Links {
  changePrice: DmvFees
  changeTradeInValue: ChangeTradeInValue
  changeZip: ChangeZip
}

export interface Listing {
  baseEXTColor: string
  baseIntColor: string
  build: ListingBuild
  carfax1Owner: boolean
  carfaxCleanTitle: boolean
  dataSource: DataSource
  dealer: Dealer
  dom: number
  dom180: number
  domActive: number
  dosActive: number
  exteriorColor: string
  extra: Extra
  firstSeenAt: number
  firstSeenAtDate: string
  firstSeenAtMc: number
  firstSeenAtMcDate: string
  firstSeenAtSource: number
  firstSeenAtSourceDate: string
  heading: string
  id: string
  inTransit: boolean
  interiorColor: string
  inventoryType: InventoryType
  lastSeenAt: number
  lastSeenAtDate: string
  media: Media
  miles: number
  msrp: number
  price: number
  priceChangePercent: number
  refMiles: number
  refMilesDt: number
  refPrice: number
  refPriceDt: number
  scrapedAt: number
  scrapedAtDate: string
  sellerType: SellerType
  source: Source
  stockNo: string
  vdpURL: string
  vin: string
}

export interface ListingBuild {
  bodyType: string
  cityMpg: number
  cylinders: number
  doors: number
  drivetrain: string
  engine: string
  engineSize: number
  fuelType: string
  highwayMpg: number
  madeIn: string
  make: string
  model: string
  overallHeight: string
  overallLength: string
  overallWidth: string
  powertrainType: string
  stdSeating: string
  transmission: string
  trim: string
  vehicleType: string
  version: string
  year: number
}

export interface LossCode {
  code: Code
  coverageLossCodeID: number
  dealerCost: number
  description: LossCodeDescription
  isSelectable: boolean
  isSelected: boolean
  isSurcharge: boolean
  suggestedRetailCost: number
}

export type LossCodeDescription = string

export interface Measurements {
  cargoCapacityAllSeatsInPlace: string
  countryOfFinalAssembly: string
  curbWeight: string
  grossWeight: string
  height: string
  length: string
  maximumCargoCapacity: string
  maximumPayload: string
  maximumTowingCapacity: string
  overallWidthWithoutMirrors: string
  turningCircle: string
  wheelbase: string
}

export type MechanicalOptions = Record<string, boolean>

export interface Media {
  photoLinks: string[]
}

export type Name = string

/** A single recall record. The populated field set depends on the upstream source: OEM manufacturer portals return the OEM block (recallDescription, defectSummary, correctiveAction, mfrNotes, status, pdf, source, …); NHTSA's per-VIN feed returns the NHTSA block (manufacturer, component, consequence, remedy, parkIt, remedyAvailable, …). Identifiers are always present; the rest are source-dependent and therefore optional. */
export interface OpenRecalls {
  component?: string
  consequence?: string
  consequenceSummary?: string
  correctiveAction?: string
  defectSummary?: string
  make?: string
  manufacturer?: string
  /** Manufacturer's own campaign id, e.g. "12D". */
  mfrCampaignNumber?: string
  mfrNotes?: string
  model?: string
  modelYear?: string
  /** NHTSA campaign id, e.g. "25V170" (may be empty for OEM-only campaigns). */
  nhtsaCampaignNumber: string
  notes?: string
  /** Resolvable via OTA software update without a dealer visit. */
  overTheAirUpdate?: boolean
  /** Do-not-drive safety flag. */
  parkIt?: boolean
  /** Park-away-from-structures (fire/explosion) safety flag. */
  parkOutSide?: boolean
  /** Link to the manufacturer's recall PDF, when available. */
  pdf?: string
  recallDate?: string
  recallDescription?: string
  remedy?: string
  /** True when the remedy/parts are available at dealers now. */
  remedyAvailable?: boolean
  reportReceivedDate?: string
  /** Upstream source identifier, e.g. "mopar-recallinfo". */
  source?: string
  /** Status as reported by the source ("Open", "Closed", "Recall Incomplete", "Completed", …). */
  status?: string
  /** Short title / summary of the campaign. */
  summary?: string
}

export interface OpenRecallsResponse {
  /** Open recalls for this specific VIN. Closed/remedied campaigns are excluded. */
  data: OpenRecalls[]
  /** Navigation links to related resources. */
  examples?: Record<string, string>
  /** Number of open recalls — equals `data.length`. */
  openRecalls: number
  /** Full make/model/year recall catalog (open + closed). Present only when the request includes `?recalls=true`. */
  recalls?: OpenRecalls[]
  /** ISO 8601 timestamp of when the returned recall data was fetched from upstream. Recall data is cached until the next daily refresh, so this is how you tell how current the answer is; pass `?skipCache=true` to force a fresh fetch. `null` when the answer wasn't sourced from a cacheable upstream. */
  retrievedAt: string | null
  /** Human-readable summary, e.g. "1 Open Recall" or "No Open Recalls". */
  status: string
  /** Total campaigns issued for this year/make/model, including ones already remedied for this VIN, so it can exceed `openRecalls`. */
  totalRecalls: number
  /** Decoded vehicle the recalls pertain to. */
  vehicle: {
    make: string
    model: string
    vin: string
    year: string
  }
}

export type Options = Record<string, string>

export interface OrderedFeature {
  category: string
  categoryGroup: string
  features: OrderedFeatureFeatures
}

export type OrderedFeatureFeatures = Record<string, string | boolean>

export interface Payments {
  calculationCriteria: CalculationCriteria
  fees: Fees
  limitCriteria: LimitCriteria
  loanAmount: number
  loanMonthlyPayment: number
  loanMonthlyPaymentWithTaxes: number
  taxes: Taxes
  totalTaxesAndFees: number
}

export interface PaymentsData {
  calculationCriteria: CalculationCriteria
  fees: Fees
  limitCriteria: LimitCriteria
  loanAmount: number
  loanMonthlyPayment: number
  loanMonthlyPaymentWithTaxes: number
  taxes: Taxes
  totalTaxesAndFees: number
}

export interface PaymentsResponse {
  apr: Record<string, number>
  criteria: Criteria
  fees: Fees
  paymentsData: PaymentsData
  services: Services
  taxes: Taxes
  totalTaxesAndFees: number
  vehicle: Vehicle
}

export interface PhotosResponse {
  data?: string[]
  examples?: Record<string, string>
  /** Last seen listed: when a source last listed the vehicle, in UTC ("YYYY-MM-DD HH:MM:SS", as `createdAt`). Only on an answer from stored photos for a vehicle with no current listing; it left the market within 48 hours after. */
  removedAt?: string
}

export type PowerFeature = Record<string, boolean>

export interface Price {
  baseInvoice: number
  baseMsrp: number
}

export interface ProductType {
  behaviorType: BehaviorType
  code: string
  description: string
}

export interface Properties {
  aspiration: string
  body: string
  bodyStyle: string
  cc: number
  cylinders: string
  drivingWheels: string
  engineBlock: string
  fuel: string
  grossVehicleWeight: string
  isNitrogenInstalled: boolean
  segmentation: string
  tiresOption: string
  tonRating: string
  transmission: string
}

export type ProviderCode = string

export type Query = Record<string, string>

export interface QueryEngineResponse {
  /** The listings. On /listings/{vin} for a vehicle with no current listing, its most recent stored listing, with `removedAt` after `createdAt`: last seen listed, when a source last listed it, in UTC ("YYYY-MM-DD HH:MM:SS", as `createdAt`); it left the market within 48 hours after. */
  data: Row[]
  facets?: Record<string, Record<string, string> | unknown>
  links: {
    first?: string
    home?: string
    last?: string
    next?: string
    prev?: string
    self?: string
    toggleFacets?: string
    toggleTotal?: string
  }
  total?: number
  totalFormatted?: string
}

export interface Rate {
  code: string
  description: string
  groupCode: string
  groupDescription: string
  isBrochure: boolean
  minimumServicesRequired: number
  productType: ProductType
  providerCode: ProviderCode
  rateBookCode: RateBookCode
  rateBookDescription: RateBookDescription
  showAsUpgrade: boolean
  terms: RateTerm[]
  vehicleAgeType: VehicleAgeType
  vehicleClass: string
  vehicleTier: string
}

export type RateBookCode = string

export type RateBookDescription = string

export interface RateTerm {
  components: Component[]
  customerValue: number
  dealerCost: number
  dealerPackAmount: number
  dealerRemit: number
  deductible: Deductible
  fiMarkup: number
  suggestedRetailCost: number
  termMonths: number
  termOdometer: number
}

export interface RatesTerm {
  apr: number
  id: null
}

export type Rearseats = Record<string, string | boolean>

export interface Recalls {
  NHTSACampaignNumber: string
  component: string
  consequence: string
  make: string
  manufacturer: string
  model: string
  modelYear: string
  nHTSAActionNumber?: string
  notes: string
  overTheAirUpdate: boolean
  parkIt: boolean
  parkOutSide: boolean
  remedy: string
  reportReceivedDate: string
  summary: string
}

export interface RecallsResponse {
  data: Recalls[]
  success: boolean
}

export type RoadsideAssistance = boolean | string

/** Represents a single row in Clickhouse.

This is a generic type, and can be used to represent any row in any table. */
export type Row = Record<string, string | number | boolean | unknown>

export type SellerType = string

export interface Services {
  buyVehicle: string
  connectYourVehicle: string
  financeInsurance: string
  getPreApproved: string
  getVehicleServiceContract: string
  inspectVehicle: string
  insureVehicle: string
  transportVehicle: string
}

export interface Shipping {
  errors: string[]
}

export type Source = string

export interface Specs {
  color: Color
  edmundsTypeCategories: EdmundsTypeCategories
  features: SpecsFeatures
  name: string
  orderedFeatures: OrderedFeature[]
  price: Price
  styleAttributes: StyleAttributes
  totalSeating: number
}

export interface SpecsFeatures {
  comfortConvenience: Record<string, boolean>
  driveTrain: DriveTrain
  engine: Engine
  exteriorOptions: Record<string, boolean>
  frontseats: Frontseats
  fuel: Fuel
  inCarEntertainment: InCarEntertainment
  instrumentation: Instrumentation
  interiorOptions: InteriorOptions
  measurements: Measurements
  mechanicalOptions: MechanicalOptions
  packages: Record<string, boolean>
  powerFeature: PowerFeature
  rearseats: Rearseats
  safety: Record<string, boolean>
  suspension: Suspension
  telematics: Telematics
  tiresAndWheels: TiresAndWheels
  warranty: Warranty
}

export interface SpecsResponse {
  specs: Specs
  vehicle: Vehicle
}

export type State = States

export type States =
  | 'AL'
  | 'AK'
  | 'AZ'
  | 'AR'
  | 'CA'
  | 'CO'
  | 'CT'
  | 'DE'
  | 'FL'
  | 'GA'
  | 'HI'
  | 'ID'
  | 'IL'
  | 'IN'
  | 'IA'
  | 'KS'
  | 'KY'
  | 'LA'
  | 'ME'
  | 'MD'
  | 'MA'
  | 'MI'
  | 'MN'
  | 'MS'
  | 'MO'
  | 'MT'
  | 'NE'
  | 'NV'
  | 'NH'
  | 'NJ'
  | 'NM'
  | 'NY'
  | 'NC'
  | 'ND'
  | 'OH'
  | 'OK'
  | 'OR'
  | 'PA'
  | 'RI'
  | 'SC'
  | 'SD'
  | 'TN'
  | 'TX'
  | 'UT'
  | 'VT'
  | 'VA'
  | 'WA'
  | 'WV'
  | 'WI'
  | 'WY'
  | 'DC'

export interface StyleAttributes {
  electric: boolean
  pluginElectric: boolean
  truck: boolean
}

export type Suspension = Record<string, boolean>

export interface TLSClientAuth {
  certFingerprintSHA1: string
  certFingerprintSHA256: string
  certIssuerDN: string
  certIssuerDNLegacy: string
  certIssuerDNRFC2253: string
  certIssuerSKI: string
  certIssuerSerial: string
  certNotAfter: string
  certNotBefore: string
  certPresented: string
  certRevoked: string
  certSKI: string
  certSerial: string
  certSubjectDN: string
  certSubjectDNLegacy: string
  certSubjectDNRFC2253: string
  certVerified: string
}

export interface TLSExportedAuthenticator {
  clientFinished: string
  clientHandshake: string
  serverFinished: string
  serverHandshake: string
}

export interface Taxes {
  combinedSalesTax: number
  gasGuzzlerTax: number
  stateSalesTax: number
}

export interface TaxesQuery {
  /** Change the Trade-In value of the vehicle, if applicable. */
  tradeIn: number
  /** Change the ZIP code to calculate taxes and fees for a different location. */
  zip: string
}

export interface TaxesResponse {
  criteria: Criteria
  data: Data
  fees: Fees
  links: Links
  services: Services
  taxes: Taxes
  totalTaxesAndFees: number
  vehicle: Vehicle
}

export type Telematics = Record<string, boolean>

export interface Terior {
  name: string
  rgb: string
}

export type TiresAndWheels = Record<string, boolean>

export interface Transport {
  available?: string
  distance: number
  enclosedTrailer: boolean
  eta: Eta
  expiration: string
  fromZip: string
  hasKeys: boolean
  id: string
  price: number
  rushEta?: Eta
  /** Omitted when the quote has no rush price: never 0 (apis#798). */
  rushPrice?: number
  standardEta?: Eta
  toZip: string
  vehicleOperational: boolean
}

export interface TransportResponse {
  transport: Transport
  vehicle: Vehicle
}

export interface Ua {
  browser: Browser
  cpu: CPU
  device: Query
  engine: Engine
  os: Engine
  ua: string
}

export interface Vehicle {
  make: string
  manufacturer: string
  model: string
  vin: string
  year: number
}

export type VehicleAgeType = string

export interface Vsc {
  rates: VscRates
  requestBody: string
}

export interface VscAPI {
  description: string
  endpoints: Endpoints
  icon: string
  login: string
  name: string
  repo: string
  signup: string
  site: string
  subscribe: string
  type: string
  url: string
}

export interface VscRates {
  containers: unknown[]
  correlationID: string
  manufactureWarranties: unknown[]
  rates: Rate[]
  totalRecordCount: number
  vehicle: {
    inServiceDate: string
    make: string
    model: string
    properties: Properties
    vehicleAgeType: string
    vehicleType: string
    vehicleYear: number
    vin: string
  }
}

export interface Warranty {
  basic: string
  drivetrain: string
  freeMaintenance: string
  roadsideAssistance: string
  rust: string
}

/** The year/make/model catalog for OEM Build Data: every make and model we hold build data for, with the model years covered. Requires no VIN — one call returns the whole catalog. Keys are make names; each value maps a model name to its year coverage, e.g. `{ "Toyota": { "4Runner": "1987-2026" } }`. */
export type YmmResponse = Record<string, Record<string, string>>

// ── Request Parameter Types ─────────────────────────────────────────

/** GET /listings/{vin} query parameters */
export interface ListingsVinParams {
  /** Filter by listing creation time (UTC). Accepts a truncated-datetime range: "2026-06-13-2026-06-15" (the 13th through the 15th, inclusive), a single whole period "2026-06" (all of June) or "2026-06-13" (that day), or an open-ended bound "2026-06-13-" (since) / "-2026-06-15" (until). Each side may be any precision: YYYY, YYYY-MM, YYYY-MM-DD, or YYYY-MM-DDTHH:MM:SS. The upper bound is inclusive of its whole period. */
  createdAt?: string
  /** Search radius in miles (default: 50) */
  distance?: number
  /** Opt in to listings without a real retail price. Default excludes them. Opted-in rows emit `retailListing.price` as null (never 0). Pass `true` or `1`. */
  includeUnpriced?: string
  /** Comma-separated includes, e.g. "facets" */
  includes?: string
  /** Results per page (default: 100) */
  limit?: number
  /** Page number (default: 1) */
  page?: number
  /** Filter by mileage. Supports a numeric range, e.g. "0-50000". */
  'retailListing.miles'?: string
  /** Filter by price. Supports a numeric range, e.g. "20000-30000", "20000-" (min), or "-30000" (max). */
  'retailListing.price'?: string
  /** Sort field and direction, e.g. "price:desc", "mileage:asc", "year:desc" */
  sort?: string
  /** Filter by listing last-updated time (UTC). Same range syntax as createdAt. */
  updatedAt?: string
  /** Filter by body style */
  'vehicle.bodyStyle'?: string
  /** Filter by drivetrain */
  'vehicle.drivetrain'?: string
  /** Filter by exterior color */
  'vehicle.exteriorColor'?: string
  /** Filter by fuel type. Use .not suffix to exclude. */
  'vehicle.fuel'?: string
  /** Filter by interior color */
  'vehicle.interiorColor'?: string
  /** Filter by vehicle make. Use .not suffix to exclude. */
  'vehicle.make'?: string
  /** Filter by vehicle model. Use .not suffix to exclude. */
  'vehicle.model'?: string
  /** Filter by transmission type */
  'vehicle.transmission'?: string
  /** Filter by trim level */
  'vehicle.trim'?: string
  /** Filter by vehicle year */
  'vehicle.year'?: string
  /** ZIP code for location-based search */
  zip?: string
}

/** GET /transport/{vin} query parameters */
export interface TransportVinParams {
  /** Use enclosed trailer (default: "false") */
  enclosedTrailer?: string
  /** Origin ZIP code (default: "55435") */
  fromZip?: string
  /** Vehicle has keys (default: "true") */
  hasKeys?: string
  /** Destination ZIP code (default: user's ZIP or "94020") */
  toZip?: string
  /** Vehicle is operational (default: "true") */
  vehicleOperational?: string
}

/** GET /recalls/{vin} query parameters */
export interface RecallsVinParams {
  /** Override make from VIN decode */
  make?: string
  /** Override model from VIN decode */
  model?: string
  /** Override year from VIN decode */
  year?: string
}

/** GET /tco/{vin} query parameters */
export interface TcoVinParams {
  /** ZIP code (default: user's ZIP or "90210") */
  zip?: string
}

/** GET /payments/{vin} query parameters */
export interface PaymentsVinParams {
  /** Credit score (default: "750") */
  creditScore?: string
  /** Documentation fee (default: 200) */
  docFee?: number
  /** Down payment amount (default: 0) */
  downPayment?: number
  /** Override interest rate */
  interestRate?: number
  /** Override vehicle price */
  price?: number
  /** Loan term in months (default: 72) */
  term?: number
  /** Trade-in value (default: 0) */
  tradeIn?: number
  /** ZIP code (default: user's ZIP or "94020") */
  zip?: string
}

/** GET /apr/{vin} query parameters */
export interface AprVinParams {
  /** Credit score (default: "720") */
  creditScore?: string
  /** Vehicle mileage */
  vehicleMileage?: string
  /** ZIP code (default: user's ZIP or "90210") */
  zip?: string
}

/** GET /openrecalls/{vin} query parameters */
export interface OpenrecallsVinParams {
  /** Override make from VIN decode */
  make?: string
  /** Override model from VIN decode */
  model?: string
  /** When set to `true`, the response includes an additional `recalls` array carrying the full make/model/year recall catalog (the same payload `/recalls/{vin}` returns in its `data` field) alongside the open-only `data` array. Useful when callers want both open campaigns for the VIN and the vehicle's full historical recall record in a single round trip. */
  recalls?: 'true' | 'false'
  /** Override year from VIN decode */
  year?: string
}

/** GET /taxes/{vin} query parameters */
export interface TaxesVinParams {
  /** Documentation fee (default: 200) */
  docFee?: number
  /** Down payment (default: 0) */
  downPayment?: number
  /** Loan term in months (default: 72) */
  months?: number
  /** Vehicle price (default: 25000) */
  price?: number
  /** Interest rate (default: 9.99) */
  rate?: number
  /** Trade-in value (default: 0) */
  tradeIn?: number
  /** ZIP code (default: user's ZIP or "94020") */
  zip?: string
}

// ── Discovered Paths ────────────────────────────────────────────────
// GET /ctx/{vin}
// GET /photos/retail/{vin}
// GET /photos/wholesale/{vin}
// GET /photos/{vin}
// GET /listings/{vin}
// GET /transport/{vin}
// GET /specs/{vin}
// GET /recalls/{vin}
// GET /tco/{vin}
// GET /payments/{vin}
// GET /marketvalue/{vin}
// GET /apr/{vin}
// GET /build/ymm
// GET /build/{vin}
// GET /openrecalls/{vin}
// GET /taxes/{vin}
