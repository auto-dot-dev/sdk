// Auto-generated from OpenAPI spec — do not edit manually
// Run: pnpm generate

// ── Response Types ──────────────────────────────────────────────────

/** API */
export interface API {
  "additionalProperties": false,
  "properties": {
    "description": {
      "type": "string"
    },
    "from": {
      "type": "string"
    },
    "login": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "repo": {
      "type": "string"
    },
    "signup": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "url": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "description",
    "url",
    "login",
    "signup",
    "repo",
    "type",
    "from"
  ],
  "type": "object"
}

/** APIDefinition */
export interface APIDefinition {
  "additionalProperties": false,
  "properties": {
    "account": {
      "type": "string"
    },
    "author": {
      "type": "string"
    },
    "build": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "docs": {
      "type": "string"
    },
    "endpoints": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    },
    "from": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "license": {
      "type": "string"
    },
    "login": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "prices": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    },
    "repo": {
      "type": "string"
    },
    "resources": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    },
    "signup": {
      "type": "string"
    },
    "site": {
      "type": "string"
    },
    "subscribe": {
      "type": "string"
    },
    "type": {
      "const": "data",
      "type": "string"
    },
    "updated": {
      "type": "string"
    },
    "url": {
      "anyOf": [
        {
          "format": "uri",
          "type": "string"
        },
        {
          "type": "string"
        }
      ]
    },
    "version": {
      "type": "string"
    }
  },
  "type": "object"
}

/** APRResponse */
export interface APRResponse {
  "additionalProperties": false,
  "properties": {
    "apr": {
      "additionalProperties": {
        "type": "number"
      },
      "type": "object"
    },
    "creditScore": {
      "type": "string"
    },
    "vehicle": {
      "additionalProperties": false,
      "properties": {
        "make": {
          "type": "string"
        },
        "model": {
          "type": "string"
        },
        "vin": {
          "type": "string"
        },
        "year": {
          "type": "number"
        }
      },
      "required": [
        "vin",
        "year",
        "make",
        "model"
      ],
      "type": "object"
    },
    "vehicleAge": {
      "type": "number"
    },
    "vehicleMileage": {
      "type": "number"
    },
    "zip": {
      "type": "string"
    }
  },
  "required": [
    "vehicle",
    "zip",
    "creditScore",
    "vehicleAge",
    "vehicleMileage",
    "apr"
  ],
  "type": "object"
}

/** Accept */
export interface Accept {
  "additionalProperties": false,
  "properties": {
    "name": {
      "type": "string"
    },
    "q": {
      "type": "number"
    },
    "subtype": {
      "type": "string"
    },
    "suffix": {
      "type": "string"
    },
    "type": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "type",
    "subtype"
  ],
  "type": "object"
}

/** AcceptLanguage */
export interface AcceptLanguage {
  "additionalProperties": false,
  "properties": {
    "extendedLanguageSubtags": {
      "items": {},
      "type": "array"
    },
    "extensions": {
      "items": {},
      "type": "array"
    },
    "irregular": {
      "type": "null"
    },
    "language": {
      "type": "string"
    },
    "privateuse": {
      "items": {},
      "type": "array"
    },
    "q": {
      "type": "number"
    },
    "region": {
      "type": [
        "null",
        "string"
      ]
    },
    "regular": {
      "type": "null"
    },
    "script": {
      "type": "null"
    },
    "variants": {
      "items": {},
      "type": "array"
    }
  },
  "required": [
    "language",
    "extendedLanguageSubtags",
    "script",
    "region",
    "variants",
    "extensions",
    "privateuse",
    "irregular",
    "regular"
  ],
  "type": "object"
}

/** AllPhotosResponse */
export interface AllPhotosResponse {
  "additionalProperties": false,
  "description": "API to search & view photos for any vehicle.",
  "properties": {
    "data": {
      "additionalProperties": false,
      "properties": {
        "retail": {
          "description": "Retail Photos",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "wholesale": {
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "type": "object"
    }
  },
  "required": [
    "data"
  ],
  "type": "object"
}

/** ApiUser */
export interface ApiUser {
  "additionalProperties": false,
  "properties": {
    "admin": {
      "type": "boolean"
    },
    "authenticated": {
      "type": "boolean"
    },
    "browser": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "continent": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "edgeDistanceKilometers": {
      "type": "number"
    },
    "edgeDistanceMiles": {
      "type": "number"
    },
    "edgeLocation": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "flag": {
      "type": "string"
    },
    "image": {
      "type": "string"
    },
    "ip": {
      "type": "string"
    },
    "isp": {
      "type": "string"
    },
    "latencyMilliseconds": {
      "type": "number"
    },
    "localTime": {
      "type": "string"
    },
    "metro": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "org": {
      "type": "string"
    },
    "os": {
      "type": "string"
    },
    "plan": {
      "enum": [
        "Free",
        "Starter",
        "Growth",
        "Scale"
      ],
      "type": "string"
    },
    "recentInteractions": {
      "type": "number"
    },
    "region": {
      "type": "string"
    },
    "requestId": {
      "type": "string"
    },
    "serviceLatency": {
      "type": "number"
    },
    "support": {
      "type": "string"
    },
    "timezone": {
      "type": "string"
    },
    "trustScore": {
      "type": "number"
    },
    "upgrade": {
      "type": "string"
    },
    "userAgent": {
      "type": "string"
    },
    "zipcode": {
      "type": "string"
    }
  },
  "required": [
    "authenticated",
    "plan",
    "os",
    "ip",
    "isp",
    "flag",
    "city",
    "metro",
    "region",
    "country",
    "continent",
    "requestId",
    "localTime",
    "timezone",
    "edgeLocation",
    "latencyMilliseconds",
    "recentInteractions",
    "trustScore"
  ],
  "type": "object"
}

/** BehaviorType */
export interface BehaviorType {
  "additionalProperties": false,
  "properties": {
    "code": {
      "type": "string"
    },
    "id": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "code"
  ],
  "type": "object"
}

/** BotManagement */
export interface BotManagement {
  "additionalProperties": false,
  "properties": {
    "corporateProxy": {
      "type": "boolean"
    },
    "detectionIDS": {
      "$ref": "#/components/schemas/Query"
    },
    "jsDetection": {
      "$ref": "#/components/schemas/JSDetection"
    },
    "score": {
      "type": "number"
    },
    "staticResource": {
      "type": "boolean"
    },
    "verifiedBot": {
      "type": "boolean"
    }
  },
  "required": [
    "corporateProxy",
    "verifiedBot",
    "jsDetection",
    "staticResource",
    "detectionIDS",
    "score"
  ],
  "type": "object"
}

/** Browser */
export interface Browser {
  "additionalProperties": false,
  "properties": {
    "major": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "version": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "version",
    "major"
  ],
  "type": "object"
}

/** Build */
export interface Build {
  "additionalProperties": false,
  "properties": {
    "confidence": {
      "type": "number"
    },
    "drivetrain": {
      "type": "string"
    },
    "engine": {
      "type": "string"
    },
    "exteriorColor": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    },
    "interiorColor": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    },
    "make": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "options": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    },
    "series": {
      "type": "string"
    },
    "style": {
      "type": "string"
    },
    "transmission": {
      "type": "string"
    },
    "trim": {
      "type": "string"
    },
    "vin": {
      "type": "string"
    },
    "year": {
      "type": "number"
    }
  },
  "required": [
    "vin",
    "year",
    "make",
    "model",
    "trim",
    "series",
    "style",
    "drivetrain",
    "engine",
    "transmission",
    "confidence",
    "interiorColor",
    "exteriorColor",
    "options"
  ],
  "type": "object"
}

/** BuildAPI */
export interface BuildAPI {
  "additionalProperties": false,
  "properties": {
    "description": {
      "type": "string"
    },
    "login": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "repo": {
      "type": "string"
    },
    "signup": {
      "type": "string"
    },
    "url": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "description",
    "url",
    "login",
    "signup",
    "repo"
  ],
  "type": "object"
}

/** BuildBuild */
export interface BuildBuild {
  "additionalProperties": false,
  "properties": {
    "confidence": {
      "type": "number"
    },
    "drivetrain": {
      "type": "string"
    },
    "engine": {
      "type": "string"
    },
    "exteriorColor": {
      "$ref": "#/components/schemas/ExteriorColor"
    },
    "interiorColor": {
      "$ref": "#/components/schemas/InteriorColor"
    },
    "make": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "options": {
      "$ref": "#/components/schemas/Options"
    },
    "series": {
      "type": "string"
    },
    "style": {
      "type": "string"
    },
    "transmission": {
      "type": "string"
    },
    "trim": {
      "type": "string"
    },
    "vin": {
      "type": "string"
    },
    "year": {
      "type": "number"
    }
  },
  "required": [
    "vin",
    "year",
    "make",
    "model",
    "trim",
    "series",
    "style",
    "drivetrain",
    "engine",
    "transmission",
    "confidence",
    "interiorColor",
    "exteriorColor",
    "options"
  ],
  "type": "object"
}

/** BuildResponse */
export interface BuildResponse {
  "additionalProperties": false,
  "properties": {
    "build": {
      "$ref": "#/components/schemas/Build"
    }
  },
  "required": [
    "build"
  ],
  "type": "object"
}

/** BuyResponse */
export interface BuyResponse {
  "additionalProperties": false,
  "properties": {
    "actions": {
      "$ref": "#/components/schemas/BuyResponseActions"
    },
    "build": {
      "$ref": "#/components/schemas/BuyResponseBuild"
    },
    "checklist": {
      "$ref": "#/components/schemas/Checklist"
    },
    "creditScore": {
      "type": "string"
    },
    "historicalListings": {
      "items": {
        "$ref": "#/components/schemas/HistoricalListing"
      },
      "type": "array"
    },
    "listing": {
      "$ref": "#/components/schemas/Listing"
    },
    "listingID": {
      "type": "string"
    },
    "miles": {
      "type": "number"
    },
    "payments": {
      "$ref": "#/components/schemas/Payments"
    },
    "price": {
      "type": "number"
    },
    "rates": {
      "$ref": "#/components/schemas/BuyResponseRates"
    },
    "shipping": {
      "$ref": "#/components/schemas/Shipping"
    },
    "vin": {
      "type": "string"
    },
    "vsc": {
      "$ref": "#/components/schemas/Vsc"
    },
    "zip": {
      "type": "string"
    }
  },
  "required": [
    "vin",
    "zip",
    "creditScore",
    "listingID",
    "price",
    "miles",
    "checklist",
    "actions",
    "payments",
    "build",
    "historicalListings",
    "rates",
    "shipping",
    "vsc",
    "listing"
  ],
  "type": "object"
}

/** BuyResponseAPI */
export interface BuyResponseAPI {
  "additionalProperties": false,
  "properties": {
    "by": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "docs": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "login": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "url": {
      "type": "string"
    }
  },
  "required": [
    "icon",
    "name",
    "description",
    "url",
    "login",
    "docs",
    "by"
  ],
  "type": "object"
}

/** BuyResponseActions */
export interface BuyResponseActions {
  "additionalProperties": false,
  "properties": {
    "changeBuyerZipCode": {
      "type": "string"
    },
    "changeDownPayment": {
      "type": "string"
    },
    "changeLoanTerm": {
      "type": "string"
    },
    "changeProtectionPlan": {
      "type": "string"
    },
    "getTradeInOffer": {
      "type": "string"
    }
  },
  "required": [
    "changeBuyerZipCode",
    "changeDownPayment",
    "changeLoanTerm",
    "changeProtectionPlan",
    "getTradeInOffer"
  ],
  "type": "object"
}

/** BuyResponseBuild */
export interface BuyResponseBuild {
  "additionalProperties": false,
  "properties": {
    "build": {
      "$ref": "#/components/schemas/BuildBuild"
    }
  },
  "required": [
    "build"
  ],
  "type": "object"
}

/** BuyResponseRates */
export interface BuyResponseRates {
  "additionalProperties": false,
  "properties": {
    "terms": {
      "additionalProperties": {
        "items": {
          "$ref": "#/components/schemas/RatesTerm"
        },
        "type": "array"
      },
      "type": "object"
    }
  },
  "required": [
    "terms"
  ],
  "type": "object"
}

/** CF */
export interface CF {
  "additionalProperties": false,
  "properties": {
    "asOrganization": {
      "type": "string"
    },
    "asn": {
      "type": "number"
    },
    "botManagement": {
      "$ref": "#/components/schemas/BotManagement"
    },
    "city": {
      "type": "string"
    },
    "clientAcceptEncoding": {
      "type": "string"
    },
    "clientTCPRtt": {
      "type": "number"
    },
    "colo": {
      "type": "string"
    },
    "continent": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "edgeRequestKeepAliveStatus": {
      "type": "number"
    },
    "httpProtocol": {
      "type": "string"
    },
    "latitude": {
      "type": "string"
    },
    "longitude": {
      "type": "string"
    },
    "postalCode": {
      "type": "string"
    },
    "region": {
      "type": "string"
    },
    "regionCode": {
      "type": "string"
    },
    "requestPriority": {
      "type": "string"
    },
    "timezone": {
      "type": "string"
    },
    "tlsCipher": {
      "type": "string"
    },
    "tlsClientAuth": {
      "$ref": "#/components/schemas/TLSClientAuth"
    },
    "tlsClientExtensionsSha1": {
      "type": "string"
    },
    "tlsClientHelloLength": {
      "type": "string"
    },
    "tlsClientRandom": {
      "type": "string"
    },
    "tlsExportedAuthenticator": {
      "$ref": "#/components/schemas/TLSExportedAuthenticator"
    },
    "tlsVersion": {
      "type": "string"
    },
    "verifiedBotCategory": {
      "type": "string"
    }
  },
  "required": [
    "clientTCPRtt",
    "longitude",
    "httpProtocol",
    "tlsCipher",
    "continent",
    "asn",
    "clientAcceptEncoding",
    "country",
    "verifiedBotCategory",
    "tlsClientAuth",
    "tlsExportedAuthenticator",
    "tlsVersion",
    "city",
    "timezone",
    "colo",
    "tlsClientHelloLength",
    "edgeRequestKeepAliveStatus",
    "postalCode",
    "region",
    "latitude",
    "requestPriority",
    "regionCode",
    "asOrganization",
    "tlsClientExtensionsSha1",
    "tlsClientRandom",
    "botManagement"
  ],
  "type": "object"
}

/** CPU */
export interface CPU {
  "additionalProperties": false,
  "properties": {
    "architecture": {
      "type": "string"
    }
  },
  "required": [
    "architecture"
  ],
  "type": "object"
}

/** CalculationCriteria */
export interface CalculationCriteria {
  "additionalProperties": false,
  "properties": {
    "applyLimits": {
      "type": "boolean"
    },
    "conditionalIncentiveAmount": {
      "type": "number"
    },
    "docFee": {
      "type": "number"
    },
    "downPayment": {
      "type": "number"
    },
    "financeRate": {
      "type": "number"
    },
    "lowerLimit": {
      "type": "boolean"
    },
    "marketValue": {
      "type": "number"
    },
    "msrp": {
      "type": "number"
    },
    "numberOfMonths": {
      "type": "number"
    },
    "primaryIncentiveAmount": {
      "type": "number"
    },
    "salesPrice": {
      "type": "number"
    },
    "styleID": {
      "type": "number"
    },
    "tradeIn": {
      "type": "number"
    },
    "tradeInOwedAmount": {
      "type": "number"
    },
    "withConcreteTaxesAndFees": {
      "type": "boolean"
    },
    "zipCode": {
      "type": "string"
    }
  },
  "required": [
    "numberOfMonths",
    "financeRate",
    "downPayment",
    "tradeIn",
    "tradeInOwedAmount",
    "salesPrice",
    "conditionalIncentiveAmount",
    "primaryIncentiveAmount",
    "docFee",
    "zipCode",
    "styleID",
    "marketValue",
    "withConcreteTaxesAndFees",
    "applyLimits",
    "msrp",
    "lowerLimit"
  ],
  "type": "object"
}

/** ChangeTradeInValue */
export interface ChangeTradeInValue {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** ChangeZip */
export interface ChangeZip {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** Checklist */
export interface Checklist {
  "additionalProperties": false,
  "properties": {
    "authorizeBankAccount": {
      "type": "string"
    },
    "connectInsuranceAccount": {
      "type": "string"
    },
    "drivewayCelebration": {
      "type": "string"
    },
    "eSignBuyersAgreement": {
      "type": "string"
    },
    "getPreApproved": {
      "type": "string"
    },
    "notarizePowerOfAttorney": {
      "type": "string"
    },
    "trackDelivery": {
      "type": "string"
    },
    "uploadDriversLicense": {
      "type": "string"
    }
  },
  "required": [
    "getPreApproved",
    "authorizeBankAccount",
    "eSignBuyersAgreement",
    "uploadDriversLicense",
    "notarizePowerOfAttorney",
    "connectInsuranceAccount",
    "trackDelivery",
    "drivewayCelebration"
  ],
  "type": "object"
}

/** City */
export interface City {
  "type": "string"
}

/** CityZips */
export interface CityZips {
  "additionalProperties": false,
  "properties": {
    "chicagoIL": {
      "type": "string"
    },
    "detroitMI": {
      "type": "string"
    },
    "losAngelesCA": {
      "type": "string"
    },
    "miamiFL": {
      "type": "string"
    },
    "minneapolisMN": {
      "type": "string"
    },
    "newYorkNY": {
      "type": "string"
    },
    "seattleWA": {
      "type": "string"
    }
  },
  "required": [
    "chicagoIL",
    "detroitMI",
    "losAngelesCA",
    "miamiFL",
    "minneapolisMN",
    "newYorkNY",
    "seattleWA"
  ],
  "type": "object"
}

/** Code */
export interface Code {
  "type": "string"
}

/** Colo */
export interface Colo {
  "additionalProperties": false,
  "properties": {
    "cca2": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "iata": {
      "type": "string"
    },
    "lat": {
      "type": "number"
    },
    "lon": {
      "type": "number"
    },
    "region": {
      "type": "string"
    }
  },
  "required": [
    "iata",
    "lat",
    "lon",
    "cca2",
    "region",
    "city"
  ],
  "type": "object"
}

/** Color */
export interface Color {
  "additionalProperties": false,
  "properties": {
    "exterior": {
      "items": {
        "$ref": "#/components/schemas/Terior"
      },
      "type": "array"
    },
    "interior": {
      "items": {
        "$ref": "#/components/schemas/Terior"
      },
      "type": "array"
    }
  },
  "required": [
    "exterior",
    "interior"
  ],
  "type": "object"
}

/** Component */
export interface Component {
  "additionalProperties": false,
  "properties": {
    "description": {
      "$ref": "#/components/schemas/ComponentDescription"
    },
    "lossCodes": {
      "items": {
        "$ref": "#/components/schemas/LossCode"
      },
      "type": "array"
    }
  },
  "required": [
    "lossCodes",
    "description"
  ],
  "type": "object"
}

/** ComponentDescription */
export interface ComponentDescription {
  "type": "string"
}

/** CreditScores */
export interface CreditScores {
  "additionalProperties": false,
  "properties": {
    "excellent": {
      "type": "number"
    },
    "fair": {
      "type": "number"
    },
    "good": {
      "type": "number"
    },
    "veryGood": {
      "type": "number"
    }
  },
  "required": [
    "fair",
    "good",
    "veryGood",
    "excellent"
  ],
  "type": "object"
}

/** Criteria */
export interface Criteria {
  "additionalProperties": false,
  "properties": {
    "docFee": {
      "type": "number"
    },
    "price": {
      "type": "number"
    },
    "tradeIn": {
      "type": "number"
    },
    "zip": {
      "type": "string"
    }
  },
  "required": [
    "price",
    "zip",
    "docFee",
    "tradeIn"
  ],
  "type": "object"
}

/** Crossover */
export interface Crossover {
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "number"
    },
    "name": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "name"
  ],
  "type": "object"
}

/** CtxResponse */
export interface CtxResponse {
  "additionalProperties": false,
  "properties": {
    "accept": {
      "items": {
        "$ref": "#/components/schemas/Accept"
      },
      "type": "array"
    },
    "acceptLanguage": {
      "items": {
        "$ref": "#/components/schemas/AcceptLanguage"
      },
      "type": "array"
    },
    "body": {
      "type": "string"
    },
    "cf": {
      "$ref": "#/components/schemas/CF"
    },
    "checkDigit": {
      "type": "string"
    },
    "checksum": {
      "type": "boolean"
    },
    "cityZips": {
      "$ref": "#/components/schemas/CityZips"
    },
    "colo": {
      "$ref": "#/components/schemas/Colo"
    },
    "cookies": {
      "type": "null"
    },
    "creditScores": {
      "$ref": "#/components/schemas/CreditScores"
    },
    "data": {
      "$ref": "#/components/schemas/Data"
    },
    "emojis": {
      "$ref": "#/components/schemas/Emojis"
    },
    "examples": {
      "$ref": "#/components/schemas/Examples"
    },
    "glyphs": {
      "$ref": "#/components/schemas/Glyphs"
    },
    "hash": {
      "type": "string"
    },
    "headers": {
      "$ref": "#/components/schemas/Headers"
    },
    "hostSegments": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "hostname": {
      "type": "string"
    },
    "infrastructure": {
      "$ref": "#/components/schemas/Infrastructure"
    },
    "instanceCreated": {
      "type": "number"
    },
    "instanceCreatedBy": {
      "type": "string"
    },
    "instanceDiff": {
      "type": "number"
    },
    "instanceDurationMilliseconds": {
      "type": "number"
    },
    "instanceDurationSeconds": {
      "type": "number"
    },
    "instanceID": {
      "type": "string"
    },
    "instancePrefix": {
      "type": "string"
    },
    "instanceRequests": {
      "type": "number"
    },
    "instanceStart": {
      "type": "number"
    },
    "make": {
      "type": "string"
    },
    "method": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "newInstance": {
      "type": "boolean"
    },
    "origin": {
      "type": "string"
    },
    "pathDefaults": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "pathSegments": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "pathname": {
      "type": "string"
    },
    "query": {
      "$ref": "#/components/schemas/Query"
    },
    "rayID": {
      "type": "string"
    },
    "requestID": {
      "type": "string"
    },
    "requestMagicBits": {
      "type": "string"
    },
    "requestMagicPrefix": {
      "type": "string"
    },
    "requestPrefix": {
      "type": "string"
    },
    "requestTimestamp": {
      "type": "number"
    },
    "rootPath": {
      "type": "boolean"
    },
    "search": {
      "type": "string"
    },
    "services": {
      "$ref": "#/components/schemas/Services"
    },
    "squishVin": {
      "type": "string"
    },
    "styleID": {
      "type": "string"
    },
    "subdomains": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "time": {
      "format": "date-time",
      "type": "string"
    },
    "ts": {
      "type": "number"
    },
    "ua": {
      "$ref": "#/components/schemas/Ua"
    },
    "url": {
      "type": "string"
    },
    "userAgent": {
      "type": "string"
    },
    "vehicle": {
      "$ref": "#/components/schemas/Vehicle"
    },
    "vin": {
      "type": "string"
    },
    "vinIsFormatted": {
      "type": "boolean"
    },
    "year": {
      "type": "string"
    }
  },
  "required": [
    "vin",
    "vinIsFormatted",
    "squishVin",
    "checkDigit",
    "checksum",
    "year",
    "make",
    "model",
    "styleID",
    "vehicle",
    "examples",
    "data",
    "services",
    "infrastructure",
    "glyphs",
    "emojis",
    "creditScores",
    "cityZips",
    "colo",
    "hostname",
    "pathname",
    "search",
    "hash",
    "origin",
    "query",
    "pathSegments",
    "pathDefaults",
    "rootPath",
    "hostSegments",
    "subdomains",
    "ts",
    "time",
    "body",
    "url",
    "method",
    "userAgent",
    "ua",
    "accept",
    "acceptLanguage",
    "cf",
    "rayID",
    "requestID",
    "requestPrefix",
    "requestTimestamp",
    "requestMagicBits",
    "requestMagicPrefix",
    "instanceID",
    "instanceCreatedBy",
    "instancePrefix",
    "instanceStart",
    "instanceCreated",
    "instanceDiff",
    "instanceDurationMilliseconds",
    "instanceDurationSeconds",
    "instanceRequests",
    "newInstance",
    "headers",
    "cookies"
  ],
  "type": "object"
}

/** Data */
export interface Data {
  "additionalProperties": false,
  "properties": {
    "bookValuation": {
      "type": "string"
    },
    "historicalPrices": {
      "type": "string"
    },
    "oemBuildData": {
      "type": "string"
    },
    "specifications": {
      "type": "string"
    },
    "totalCostOfOwnership": {
      "type": "string"
    },
    "vehicleHistoryReport": {
      "type": "string"
    },
    "vehicleListings": {
      "type": "string"
    },
    "windowSticker": {
      "type": "string"
    }
  },
  "required": [
    "oemBuildData",
    "specifications",
    "totalCostOfOwnership",
    "vehicleListings",
    "bookValuation",
    "historicalPrices",
    "vehicleHistoryReport",
    "windowSticker"
  ],
  "type": "object"
}

/** DataSource */
export interface DataSource {
  "type": "string"
}

/** Dealer */
export interface Dealer {
  "additionalProperties": false,
  "properties": {
    "city": {
      "$ref": "#/components/schemas/City"
    },
    "country": {
      "type": "string"
    },
    "dealerType": {
      "type": "string"
    },
    "id": {
      "type": "number"
    },
    "latitude": {
      "type": "string"
    },
    "longitude": {
      "type": "string"
    },
    "name": {
      "$ref": "#/components/schemas/Name"
    },
    "phone": {
      "type": "string"
    },
    "state": {
      "$ref": "#/components/schemas/State"
    },
    "street": {
      "type": "string"
    },
    "website": {
      "$ref": "#/components/schemas/Source"
    },
    "zip": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "website",
    "name",
    "dealerType",
    "street",
    "city",
    "state",
    "country",
    "latitude",
    "longitude",
    "zip",
    "phone"
  ],
  "type": "object"
}

/** Deductible */
export interface Deductible {
  "additionalProperties": false,
  "properties": {
    "amount": {
      "type": "number"
    },
    "description": {
      "$ref": "#/components/schemas/DeductibleDescription"
    },
    "type": {
      "$ref": "#/components/schemas/DeductibleType"
    }
  },
  "required": [
    "type"
  ],
  "type": "object"
}

/** DeductibleDescription */
export interface DeductibleDescription {
  "type": "string"
}

/** DeductibleType */
export interface DeductibleType {
  "type": "string"
}

/** DmvFees */
export interface DmvFees {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** DmvFeesItemized */
export interface DmvFeesItemized {
  "additionalProperties": false,
  "properties": {
    "name": {
      "type": "string"
    },
    "value": {
      "type": "number"
    }
  },
  "required": [
    "name",
    "value"
  ],
  "type": "object"
}

/** DriveTrain */
export interface DriveTrain {
  "additionalProperties": false,
  "properties": {
    "centerLimitedSlipDifferential": {
      "type": "boolean"
    },
    "driveType": {
      "type": "string"
    },
    "transmission": {
      "type": "string"
    }
  },
  "required": [
    "driveType",
    "centerLimitedSlipDifferential",
    "transmission"
  ],
  "type": "object"
}

/** EdmundsTypeCategories */
export interface EdmundsTypeCategories {
  "additionalProperties": false,
  "properties": {
    "crossover": {
      "$ref": "#/components/schemas/Crossover"
    },
    "suv": {
      "$ref": "#/components/schemas/Crossover"
    }
  },
  "required": [
    "crossover",
    "suv"
  ],
  "type": "object"
}

/** Emojis */
export interface Emojis {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** Endpoints */
export interface Endpoints {
  "additionalProperties": false,
  "properties": {
    "create": {
      "type": "string"
    },
    "preview": {
      "type": "string"
    },
    "quote": {
      "type": "string"
    }
  },
  "required": [
    "quote",
    "preview",
    "create"
  ],
  "type": "object"
}

/** Engine */
export interface Engine {
  "additionalProperties": false,
  "properties": {
    "baseEngineSize": {
      "type": "string"
    },
    "baseEngineType": {
      "type": "string"
    },
    "camType": {
      "type": "string"
    },
    "cylinders": {
      "type": "string"
    },
    "directInjection": {
      "type": "boolean"
    },
    "horsepower": {
      "type": "string"
    },
    "torque": {
      "type": "string"
    },
    "valveTiming": {
      "type": "string"
    },
    "valves": {
      "type": "string"
    }
  },
  "required": [
    "torque",
    "baseEngineSize",
    "horsepower",
    "valves",
    "baseEngineType",
    "directInjection",
    "valveTiming",
    "cylinders",
    "camType"
  ],
  "type": "object"
}

/** Eta */
export interface Eta {
  "additionalProperties": false,
  "properties": {
    "max": {
      "type": "number"
    },
    "min": {
      "type": "number"
    }
  },
  "required": [
    "min",
    "max"
  ],
  "type": "object"
}

/** Examples */
export interface Examples {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** ExteriorColor */
export interface ExteriorColor {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** Extra */
export interface Extra {
  "additionalProperties": false,
  "properties": {
    "features": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "highValueFeatures": {
      "items": {
        "$ref": "#/components/schemas/HighValueFeature"
      },
      "type": "array"
    },
    "optionsPackages": {
      "items": {
        "type": "string"
      },
      "type": "array"
    }
  },
  "required": [
    "features",
    "highValueFeatures",
    "optionsPackages"
  ],
  "type": "object"
}

/** Fees */
export interface Fees {
  "additionalProperties": false,
  "properties": {
    "combinedFees": {
      "type": "number"
    },
    "dmvFee": {
      "type": "number"
    },
    "dmvFees": {
      "$ref": "#/components/schemas/DmvFees"
    },
    "docFee": {
      "type": "number"
    },
    "registrationFee": {
      "type": "number"
    },
    "titleFee": {
      "type": "number"
    }
  },
  "required": [
    "titleFee",
    "registrationFee",
    "dmvFee",
    "combinedFees",
    "docFee",
    "dmvFees"
  ],
  "type": "object"
}

/** Frontseats */
export interface Frontseats {
  "additionalProperties": false,
  "properties": {
    "bucketFrontSeats": {
      "type": "boolean"
    },
    "driverSeatWithPowerAdjustableLumbarSupport": {
      "type": "boolean"
    },
    "frontHeadRoom": {
      "type": "string"
    },
    "frontHipRoom": {
      "type": "string"
    },
    "frontLegRoom": {
      "type": "string"
    },
    "frontShoulderRoom": {
      "type": "string"
    },
    "heightAdjustableDriverSeat": {
      "type": "boolean"
    },
    "premiumCloth": {
      "type": "boolean"
    },
    "the4WayManualPassengerSeatAdjustment": {
      "type": "boolean"
    },
    "the8WayPowerDriverSeat": {
      "type": "boolean"
    }
  },
  "required": [
    "frontHeadRoom",
    "premiumCloth",
    "bucketFrontSeats",
    "the4WayManualPassengerSeatAdjustment",
    "heightAdjustableDriverSeat",
    "frontShoulderRoom",
    "driverSeatWithPowerAdjustableLumbarSupport",
    "the8WayPowerDriverSeat",
    "frontLegRoom",
    "frontHipRoom"
  ],
  "type": "object"
}

/** Fuel */
export interface Fuel {
  "additionalProperties": false,
  "properties": {
    "epaCityHighwayMpg": {
      "type": "string"
    },
    "epaCombinedMpg": {
      "type": "string"
    },
    "fuelTankCapacity": {
      "type": "string"
    },
    "fuelType": {
      "type": "string"
    },
    "rangeInMilesCityHwy": {
      "type": "string"
    }
  },
  "required": [
    "epaCombinedMpg",
    "epaCityHighwayMpg",
    "rangeInMilesCityHwy",
    "fuelTankCapacity",
    "fuelType"
  ],
  "type": "object"
}

/** Glyphs */
export interface Glyphs {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** Headers */
export interface Headers {
  "additionalProperties": false,
  "properties": {
    "accept": {
      "type": "string"
    },
    "acceptEncoding": {
      "type": "string"
    },
    "acceptLanguage": {
      "type": "string"
    },
    "cfConnectingIP": {
      "type": "string"
    },
    "cfIpcountry": {
      "type": "string"
    },
    "cfRay": {
      "type": "string"
    },
    "cfVisitor": {
      "type": "string"
    },
    "connection": {
      "type": "string"
    },
    "dnt": {
      "type": "string"
    },
    "host": {
      "type": "string"
    },
    "priority": {
      "type": "string"
    },
    "secFetchDest": {
      "type": "string"
    },
    "secFetchMode": {
      "type": "string"
    },
    "secFetchSite": {
      "type": "string"
    },
    "secFetchUser": {
      "type": "string"
    },
    "secGpc": {
      "type": "string"
    },
    "upgradeInsecureRequests": {
      "type": "string"
    },
    "userAgent": {
      "type": "string"
    },
    "xForwardedProto": {
      "type": "string"
    },
    "xRealIP": {
      "type": "string"
    }
  },
  "required": [
    "accept",
    "acceptEncoding",
    "acceptLanguage",
    "cfConnectingIP",
    "cfIpcountry",
    "cfRay",
    "cfVisitor",
    "connection",
    "dnt",
    "host",
    "priority",
    "secFetchDest",
    "secFetchMode",
    "secFetchSite",
    "secFetchUser",
    "secGpc",
    "upgradeInsecureRequests",
    "userAgent",
    "xForwardedProto",
    "xRealIP"
  ],
  "type": "object"
}

/** HighValueFeature */
export interface HighValueFeature {
  "additionalProperties": false,
  "properties": {
    "category": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "type": {
      "$ref": "#/components/schemas/HighValueFeatureType"
    }
  },
  "required": [
    "category",
    "description",
    "type"
  ],
  "type": "object"
}

/** HighValueFeatureType */
export interface HighValueFeatureType {
  "type": "string"
}

/** HistoricalListing */
export interface HistoricalListing {
  "additionalProperties": false,
  "properties": {
    "city": {
      "$ref": "#/components/schemas/City"
    },
    "dataSource": {
      "$ref": "#/components/schemas/DataSource"
    },
    "firstSeenAt": {
      "type": "number"
    },
    "firstSeenAtDate": {
      "format": "date-time",
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "inventoryType": {
      "$ref": "#/components/schemas/InventoryType"
    },
    "lastSeenAt": {
      "type": "number"
    },
    "lastSeenAtDate": {
      "format": "date-time",
      "type": "string"
    },
    "miles": {
      "type": "number"
    },
    "price": {
      "type": "number"
    },
    "scrapedAt": {
      "type": "number"
    },
    "scrapedAtDate": {
      "format": "date-time",
      "type": "string"
    },
    "sellerName": {
      "$ref": "#/components/schemas/Name"
    },
    "sellerType": {
      "$ref": "#/components/schemas/SellerType"
    },
    "source": {
      "$ref": "#/components/schemas/Source"
    },
    "state": {
      "$ref": "#/components/schemas/State"
    },
    "statusDate": {
      "type": "number"
    },
    "vdpURL": {
      "type": "string"
    },
    "zip": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "dataSource",
    "vdpURL",
    "sellerType",
    "inventoryType",
    "lastSeenAt",
    "lastSeenAtDate",
    "scrapedAt",
    "scrapedAtDate",
    "firstSeenAt",
    "firstSeenAtDate",
    "source",
    "sellerName",
    "city",
    "state",
    "zip",
    "statusDate"
  ],
  "type": "object"
}

/** InCarEntertainment */
export interface InCarEntertainment {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** Incentive */
export interface Incentive {
  "additionalProperties": false,
  "properties": {
    "apr": {
      "type": "number"
    },
    "aprDescription": {
      "type": "string"
    },
    "bulletPoints": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "cashDescription": {
      "type": "string"
    },
    "conditionalCash": {
      "type": "number"
    },
    "conditionalDescription": {
      "type": "string"
    },
    "costPerMile": {
      "type": "number"
    },
    "disclaimer": {
      "type": "string"
    },
    "display": {
      "type": "boolean"
    },
    "dispositionFee": {
      "type": "number"
    },
    "endDate": {
      "type": "string"
    },
    "leaseDescription": {
      "type": "string"
    },
    "make": {
      "type": "string"
    },
    "manufactName": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "msrp": {
      "type": "number"
    },
    "payment": {
      "type": "number"
    },
    "per1000": {
      "type": "number"
    },
    "term": {
      "type": "number"
    },
    "title": {
      "type": "string"
    },
    "totalCash": {
      "type": "number"
    },
    "totalPayments": {
      "type": "number"
    },
    "type": {
      "type": "string"
    },
    "vehicle": {
      "additionalProperties": false,
      "properties": {
        "make": {
          "type": "string"
        },
        "model": {
          "type": "string"
        },
        "year": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "webURL": {
      "type": "string"
    },
    "year": {
      "type": "string"
    }
  },
  "type": "object"
}

/** Infrastructure */
export interface Infrastructure {
  "additionalProperties": false,
  "properties": {
    "authenticate": {
      "type": "string"
    },
    "cryptoHash": {
      "type": "string"
    },
    "keyValueStore": {
      "type": "string"
    }
  },
  "required": [
    "authenticate",
    "keyValueStore",
    "cryptoHash"
  ],
  "type": "object"
}

/** Instrumentation */
export interface Instrumentation {
  "additionalProperties": false,
  "properties": {
    "clock": {
      "type": "boolean"
    },
    "compass": {
      "type": "boolean"
    },
    "externalTemperatureDisplay": {
      "type": "boolean"
    },
    "tachometer": {
      "type": "boolean"
    },
    "tripComputer": {
      "type": "boolean"
    }
  },
  "required": [
    "clock",
    "compass",
    "externalTemperatureDisplay",
    "tripComputer",
    "tachometer"
  ],
  "type": "object"
}

/** InteriorColor */
export interface InteriorColor {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** InteriorOptions */
export interface InteriorOptions {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** InventoryType */
export interface InventoryType {
  "type": "string"
}

/** JSDetection */
export interface JSDetection {
  "additionalProperties": false,
  "properties": {
    "passed": {
      "type": "boolean"
    }
  },
  "required": [
    "passed"
  ],
  "type": "object"
}

/** LimitCriteria */
export interface LimitCriteria {
  "additionalProperties": false,
  "properties": {
    "limitPercentage": {
      "type": "number"
    },
    "limitPrice": {
      "type": "number"
    },
    "limits": {
      "items": {},
      "type": "array"
    }
  },
  "required": [
    "limitPercentage",
    "limitPrice",
    "limits"
  ],
  "type": "object"
}

/** Links */
export interface Links {
  "additionalProperties": false,
  "properties": {
    "changePrice": {
      "$ref": "#/components/schemas/DmvFees"
    },
    "changeTradeInValue": {
      "$ref": "#/components/schemas/ChangeTradeInValue"
    },
    "changeZip": {
      "$ref": "#/components/schemas/ChangeZip"
    }
  },
  "required": [
    "changePrice",
    "changeZip",
    "changeTradeInValue"
  ],
  "type": "object"
}

/** Listing */
export interface Listing {
  "additionalProperties": false,
  "properties": {
    "baseEXTColor": {
      "type": "string"
    },
    "baseIntColor": {
      "type": "string"
    },
    "build": {
      "$ref": "#/components/schemas/ListingBuild"
    },
    "carfax1Owner": {
      "type": "boolean"
    },
    "carfaxCleanTitle": {
      "type": "boolean"
    },
    "dataSource": {
      "$ref": "#/components/schemas/DataSource"
    },
    "dealer": {
      "$ref": "#/components/schemas/Dealer"
    },
    "dom": {
      "type": "number"
    },
    "dom180": {
      "type": "number"
    },
    "domActive": {
      "type": "number"
    },
    "dosActive": {
      "type": "number"
    },
    "exteriorColor": {
      "type": "string"
    },
    "extra": {
      "$ref": "#/components/schemas/Extra"
    },
    "firstSeenAt": {
      "type": "number"
    },
    "firstSeenAtDate": {
      "format": "date-time",
      "type": "string"
    },
    "firstSeenAtMc": {
      "type": "number"
    },
    "firstSeenAtMcDate": {
      "format": "date-time",
      "type": "string"
    },
    "firstSeenAtSource": {
      "type": "number"
    },
    "firstSeenAtSourceDate": {
      "format": "date-time",
      "type": "string"
    },
    "heading": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "inTransit": {
      "type": "boolean"
    },
    "interiorColor": {
      "type": "string"
    },
    "inventoryType": {
      "$ref": "#/components/schemas/InventoryType"
    },
    "lastSeenAt": {
      "type": "number"
    },
    "lastSeenAtDate": {
      "format": "date-time",
      "type": "string"
    },
    "media": {
      "$ref": "#/components/schemas/Media"
    },
    "miles": {
      "type": "number"
    },
    "msrp": {
      "type": "number"
    },
    "price": {
      "type": "number"
    },
    "priceChangePercent": {
      "type": "number"
    },
    "refMiles": {
      "type": "number"
    },
    "refMilesDt": {
      "type": "number"
    },
    "refPrice": {
      "type": "number"
    },
    "refPriceDt": {
      "type": "number"
    },
    "scrapedAt": {
      "type": "number"
    },
    "scrapedAtDate": {
      "format": "date-time",
      "type": "string"
    },
    "sellerType": {
      "$ref": "#/components/schemas/SellerType"
    },
    "source": {
      "$ref": "#/components/schemas/Source"
    },
    "stockNo": {
      "type": "string"
    },
    "vdpURL": {
      "type": "string"
    },
    "vin": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "vin",
    "heading",
    "price",
    "priceChangePercent",
    "miles",
    "msrp",
    "dataSource",
    "vdpURL",
    "carfax1Owner",
    "carfaxCleanTitle",
    "exteriorColor",
    "interiorColor",
    "baseIntColor",
    "baseEXTColor",
    "dom",
    "dom180",
    "domActive",
    "dosActive",
    "sellerType",
    "inventoryType",
    "stockNo",
    "lastSeenAt",
    "lastSeenAtDate",
    "scrapedAt",
    "scrapedAtDate",
    "firstSeenAt",
    "firstSeenAtDate",
    "firstSeenAtMc",
    "firstSeenAtMcDate",
    "firstSeenAtSource",
    "firstSeenAtSourceDate",
    "refPrice",
    "refPriceDt",
    "refMiles",
    "refMilesDt",
    "source",
    "inTransit",
    "media",
    "extra",
    "dealer",
    "build"
  ],
  "type": "object"
}

/** ListingBuild */
export interface ListingBuild {
  "additionalProperties": false,
  "properties": {
    "bodyType": {
      "type": "string"
    },
    "cityMpg": {
      "type": "number"
    },
    "cylinders": {
      "type": "number"
    },
    "doors": {
      "type": "number"
    },
    "drivetrain": {
      "type": "string"
    },
    "engine": {
      "type": "string"
    },
    "engineSize": {
      "type": "number"
    },
    "fuelType": {
      "type": "string"
    },
    "highwayMpg": {
      "type": "number"
    },
    "madeIn": {
      "type": "string"
    },
    "make": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "overallHeight": {
      "type": "string"
    },
    "overallLength": {
      "type": "string"
    },
    "overallWidth": {
      "type": "string"
    },
    "powertrainType": {
      "type": "string"
    },
    "stdSeating": {
      "type": "string"
    },
    "transmission": {
      "type": "string"
    },
    "trim": {
      "type": "string"
    },
    "vehicleType": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "year": {
      "type": "number"
    }
  },
  "required": [
    "year",
    "make",
    "model",
    "trim",
    "version",
    "bodyType",
    "vehicleType",
    "transmission",
    "drivetrain",
    "fuelType",
    "engine",
    "engineSize",
    "doors",
    "cylinders",
    "madeIn",
    "overallHeight",
    "overallLength",
    "overallWidth",
    "stdSeating",
    "highwayMpg",
    "cityMpg",
    "powertrainType"
  ],
  "type": "object"
}

/** LossCode */
export interface LossCode {
  "additionalProperties": false,
  "properties": {
    "code": {
      "$ref": "#/components/schemas/Code"
    },
    "coverageLossCodeID": {
      "type": "number"
    },
    "dealerCost": {
      "type": "number"
    },
    "description": {
      "$ref": "#/components/schemas/LossCodeDescription"
    },
    "isSelectable": {
      "type": "boolean"
    },
    "isSelected": {
      "type": "boolean"
    },
    "isSurcharge": {
      "type": "boolean"
    },
    "suggestedRetailCost": {
      "type": "number"
    }
  },
  "required": [
    "coverageLossCodeID",
    "isSelected",
    "isSelectable",
    "dealerCost",
    "suggestedRetailCost",
    "code",
    "description",
    "isSurcharge"
  ],
  "type": "object"
}

/** LossCodeDescription */
export interface LossCodeDescription {
  "type": "string"
}

/** Measurements */
export interface Measurements {
  "additionalProperties": false,
  "properties": {
    "cargoCapacityAllSeatsInPlace": {
      "type": "string"
    },
    "countryOfFinalAssembly": {
      "type": "string"
    },
    "curbWeight": {
      "type": "string"
    },
    "grossWeight": {
      "type": "string"
    },
    "height": {
      "type": "string"
    },
    "length": {
      "type": "string"
    },
    "maximumCargoCapacity": {
      "type": "string"
    },
    "maximumPayload": {
      "type": "string"
    },
    "maximumTowingCapacity": {
      "type": "string"
    },
    "overallWidthWithoutMirrors": {
      "type": "string"
    },
    "turningCircle": {
      "type": "string"
    },
    "wheelbase": {
      "type": "string"
    }
  },
  "required": [
    "maximumCargoCapacity",
    "countryOfFinalAssembly",
    "wheelbase",
    "curbWeight",
    "grossWeight",
    "cargoCapacityAllSeatsInPlace",
    "maximumPayload",
    "length",
    "maximumTowingCapacity",
    "turningCircle",
    "height",
    "overallWidthWithoutMirrors"
  ],
  "type": "object"
}

/** MechanicalOptions */
export interface MechanicalOptions {
  "additionalProperties": {
    "type": "boolean"
  },
  "type": "object"
}

/** Media */
export interface Media {
  "additionalProperties": false,
  "properties": {
    "photoLinks": {
      "items": {
        "type": "string"
      },
      "type": "array"
    }
  },
  "required": [
    "photoLinks"
  ],
  "type": "object"
}

/** Name */
export interface Name {
  "type": "string"
}

/** OpenRecalls */
export interface OpenRecalls {
  "additionalProperties": false,
  "properties": {
    "actionTaken": {
      "type": "string"
    },
    "affected": {
      "type": "number"
    },
    "campaign": {
      "type": "string"
    },
    "components": {
      "type": "string"
    },
    "consequence": {
      "type": "string"
    },
    "defect": {
      "type": "string"
    },
    "dontDrive": {
      "type": "boolean"
    },
    "manufacturer": {
      "type": "string"
    },
    "nhtsaActionNumber": {
      "type": "string"
    },
    "ownerNotified": {
      "format": "date-time",
      "type": "string"
    },
    "parkOutside": {
      "type": "boolean"
    },
    "recallDate": {
      "format": "date-time",
      "type": "string"
    },
    "recordDate": {
      "format": "date-time",
      "type": "string"
    }
  },
  "required": [
    "campaign",
    "components",
    "affected",
    "ownerNotified",
    "manufacturer",
    "recallDate",
    "recordDate",
    "defect",
    "consequence",
    "actionTaken",
    "dontDrive",
    "parkOutside",
    "nhtsaActionNumber"
  ],
  "type": "object"
}

/** OpenRecallsResponse */
export interface OpenRecallsResponse {
  "additionalProperties": false,
  "properties": {
    "data": {
      "items": {
        "$ref": "#/components/schemas/OpenRecalls"
      },
      "type": "array"
    },
    "success": {
      "type": "boolean"
    },
    "vehicle": {
      "additionalProperties": false,
      "properties": {
        "make": {
          "type": "string"
        },
        "model": {
          "type": "string"
        },
        "vin": {
          "type": "string"
        },
        "year": {
          "type": "string"
        }
      },
      "required": [
        "year",
        "make",
        "model",
        "vin"
      ],
      "type": "object"
    }
  },
  "required": [
    "success",
    "vehicle",
    "data"
  ],
  "type": "object"
}

/** Options */
export interface Options {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** OrderedFeature */
export interface OrderedFeature {
  "additionalProperties": false,
  "properties": {
    "category": {
      "type": "string"
    },
    "categoryGroup": {
      "type": "string"
    },
    "features": {
      "$ref": "#/components/schemas/OrderedFeatureFeatures"
    }
  },
  "required": [
    "category",
    "categoryGroup",
    "features"
  ],
  "type": "object"
}

/** OrderedFeatureFeatures */
export interface OrderedFeatureFeatures {
  "additionalProperties": {
    "type": [
      "string",
      "boolean"
    ]
  },
  "type": "object"
}

/** Payments */
export interface Payments {
  "additionalProperties": false,
  "properties": {
    "calculationCriteria": {
      "$ref": "#/components/schemas/CalculationCriteria"
    },
    "fees": {
      "$ref": "#/components/schemas/Fees"
    },
    "limitCriteria": {
      "$ref": "#/components/schemas/LimitCriteria"
    },
    "loanAmount": {
      "type": "number"
    },
    "loanMonthlyPayment": {
      "type": "number"
    },
    "loanMonthlyPaymentWithTaxes": {
      "type": "number"
    },
    "taxes": {
      "$ref": "#/components/schemas/Taxes"
    },
    "totalTaxesAndFees": {
      "type": "number"
    }
  },
  "required": [
    "loanAmount",
    "loanMonthlyPayment",
    "loanMonthlyPaymentWithTaxes",
    "totalTaxesAndFees",
    "taxes",
    "fees",
    "calculationCriteria",
    "limitCriteria"
  ],
  "type": "object"
}

/** PaymentsData */
export interface PaymentsData {
  "additionalProperties": false,
  "properties": {
    "calculationCriteria": {
      "$ref": "#/components/schemas/CalculationCriteria"
    },
    "fees": {
      "$ref": "#/components/schemas/Fees"
    },
    "limitCriteria": {
      "$ref": "#/components/schemas/LimitCriteria"
    },
    "loanAmount": {
      "type": "number"
    },
    "loanMonthlyPayment": {
      "type": "number"
    },
    "loanMonthlyPaymentWithTaxes": {
      "type": "number"
    },
    "taxes": {
      "$ref": "#/components/schemas/Taxes"
    },
    "totalTaxesAndFees": {
      "type": "number"
    }
  },
  "required": [
    "loanAmount",
    "loanMonthlyPayment",
    "loanMonthlyPaymentWithTaxes",
    "totalTaxesAndFees",
    "taxes",
    "fees",
    "calculationCriteria",
    "limitCriteria"
  ],
  "type": "object"
}

/** PaymentsResponse */
export interface PaymentsResponse {
  "additionalProperties": false,
  "properties": {
    "apr": {
      "additionalProperties": {
        "type": "number"
      },
      "type": "object"
    },
    "criteria": {
      "$ref": "#/components/schemas/Criteria"
    },
    "fees": {
      "$ref": "#/components/schemas/Fees"
    },
    "paymentsData": {
      "$ref": "#/components/schemas/PaymentsData"
    },
    "services": {
      "$ref": "#/components/schemas/Services"
    },
    "taxes": {
      "$ref": "#/components/schemas/Taxes"
    },
    "totalTaxesAndFees": {
      "type": "number"
    },
    "vehicle": {
      "$ref": "#/components/schemas/Vehicle"
    }
  },
  "required": [
    "vehicle",
    "criteria",
    "paymentsData",
    "apr",
    "totalTaxesAndFees",
    "taxes",
    "fees",
    "services"
  ],
  "type": "object"
}

/** PhotosResponse */
export interface PhotosResponse {
  "additionalProperties": false,
  "properties": {
    "data": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "examples": {
      "additionalProperties": {
        "type": "string"
      },
      "type": "object"
    }
  },
  "type": "object"
}

/** PowerFeature */
export interface PowerFeature {
  "additionalProperties": {
    "type": "boolean"
  },
  "type": "object"
}

/** Price */
export interface Price {
  "additionalProperties": false,
  "properties": {
    "baseInvoice": {
      "type": "number"
    },
    "baseMsrp": {
      "type": "number"
    }
  },
  "required": [
    "baseMsrp",
    "baseInvoice"
  ],
  "type": "object"
}

/** ProductType */
export interface ProductType {
  "additionalProperties": false,
  "properties": {
    "behaviorType": {
      "$ref": "#/components/schemas/BehaviorType"
    },
    "code": {
      "type": "string"
    },
    "description": {
      "type": "string"
    }
  },
  "required": [
    "code",
    "description",
    "behaviorType"
  ],
  "type": "object"
}

/** Properties */
export interface Properties {
  "additionalProperties": false,
  "properties": {
    "aspiration": {
      "type": "string"
    },
    "body": {
      "type": "string"
    },
    "bodyStyle": {
      "type": "string"
    },
    "cc": {
      "type": "number"
    },
    "cylinders": {
      "type": "string"
    },
    "drivingWheels": {
      "type": "string"
    },
    "engineBlock": {
      "type": "string"
    },
    "fuel": {
      "type": "string"
    },
    "grossVehicleWeight": {
      "type": "string"
    },
    "isNitrogenInstalled": {
      "type": "boolean"
    },
    "segmentation": {
      "type": "string"
    },
    "tiresOption": {
      "type": "string"
    },
    "tonRating": {
      "type": "string"
    },
    "transmission": {
      "type": "string"
    }
  },
  "required": [
    "segmentation",
    "fuel",
    "aspiration",
    "grossVehicleWeight",
    "tonRating",
    "cc",
    "bodyStyle",
    "engineBlock",
    "body",
    "transmission",
    "tiresOption",
    "cylinders",
    "drivingWheels",
    "isNitrogenInstalled"
  ],
  "type": "object"
}

/** ProviderCode */
export interface ProviderCode {
  "type": "string"
}

/** Query */
export interface Query {
  "additionalProperties": {
    "type": "string"
  },
  "type": "object"
}

/** QueryEngineResponse */
export interface QueryEngineResponse {
  "additionalProperties": false,
  "properties": {
    "data": {
      "items": {
        "$ref": "#/components/schemas/Row"
      },
      "type": "array"
    },
    "facets": {
      "additionalProperties": {
        "anyOf": [
          {
            "additionalProperties": {
              "type": "string"
            },
            "type": "object"
          },
          {
            "not": {}
          }
        ]
      },
      "type": "object"
    },
    "links": {
      "additionalProperties": false,
      "properties": {
        "first": {
          "type": "string"
        },
        "home": {
          "type": "string"
        },
        "last": {
          "type": "string"
        },
        "next": {
          "type": "string"
        },
        "prev": {
          "type": "string"
        },
        "self": {
          "type": "string"
        },
        "toggleFacets": {
          "type": "string"
        },
        "toggleTotal": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "total": {
      "type": "number"
    },
    "totalFormatted": {
      "type": "string"
    }
  },
  "required": [
    "links",
    "data"
  ],
  "type": "object"
}

/** Rate */
export interface Rate {
  "additionalProperties": false,
  "properties": {
    "code": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "groupCode": {
      "type": "string"
    },
    "groupDescription": {
      "type": "string"
    },
    "isBrochure": {
      "type": "boolean"
    },
    "minimumServicesRequired": {
      "type": "number"
    },
    "productType": {
      "$ref": "#/components/schemas/ProductType"
    },
    "providerCode": {
      "$ref": "#/components/schemas/ProviderCode"
    },
    "rateBookCode": {
      "$ref": "#/components/schemas/RateBookCode"
    },
    "rateBookDescription": {
      "$ref": "#/components/schemas/RateBookDescription"
    },
    "showAsUpgrade": {
      "type": "boolean"
    },
    "terms": {
      "items": {
        "$ref": "#/components/schemas/RateTerm"
      },
      "type": "array"
    },
    "vehicleAgeType": {
      "$ref": "#/components/schemas/VehicleAgeType"
    },
    "vehicleClass": {
      "type": "string"
    },
    "vehicleTier": {
      "type": "string"
    }
  },
  "required": [
    "code",
    "description",
    "productType",
    "vehicleAgeType",
    "groupCode",
    "groupDescription",
    "vehicleClass",
    "vehicleTier",
    "providerCode",
    "minimumServicesRequired",
    "isBrochure",
    "terms",
    "rateBookCode",
    "rateBookDescription",
    "showAsUpgrade"
  ],
  "type": "object"
}

/** RateBookCode */
export interface RateBookCode {
  "type": "string"
}

/** RateBookDescription */
export interface RateBookDescription {
  "type": "string"
}

/** RateTerm */
export interface RateTerm {
  "additionalProperties": false,
  "properties": {
    "components": {
      "items": {
        "$ref": "#/components/schemas/Component"
      },
      "type": "array"
    },
    "customerValue": {
      "type": "number"
    },
    "dealerCost": {
      "type": "number"
    },
    "dealerPackAmount": {
      "type": "number"
    },
    "dealerRemit": {
      "type": "number"
    },
    "deductible": {
      "$ref": "#/components/schemas/Deductible"
    },
    "fiMarkup": {
      "type": "number"
    },
    "suggestedRetailCost": {
      "type": "number"
    },
    "termMonths": {
      "type": "number"
    },
    "termOdometer": {
      "type": "number"
    }
  },
  "required": [
    "termOdometer",
    "components",
    "termMonths",
    "dealerRemit",
    "dealerCost",
    "dealerPackAmount",
    "fiMarkup",
    "suggestedRetailCost",
    "customerValue",
    "deductible"
  ],
  "type": "object"
}

/** RatesTerm */
export interface RatesTerm {
  "additionalProperties": false,
  "properties": {
    "apr": {
      "type": "number"
    },
    "id": {
      "type": "null"
    }
  },
  "required": [
    "id",
    "apr"
  ],
  "type": "object"
}

/** Rearseats */
export interface Rearseats {
  "additionalProperties": {
    "type": [
      "string",
      "boolean"
    ]
  },
  "type": "object"
}

/** Recalls */
export interface Recalls {
  "additionalProperties": false,
  "properties": {
    "NHTSACampaignNumber": {
      "type": "string"
    },
    "component": {
      "type": "string"
    },
    "consequence": {
      "type": "string"
    },
    "make": {
      "type": "string"
    },
    "manufacturer": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "modelYear": {
      "type": "string"
    },
    "nHTSAActionNumber": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    },
    "overTheAirUpdate": {
      "type": "boolean"
    },
    "parkIt": {
      "type": "boolean"
    },
    "parkOutSide": {
      "type": "boolean"
    },
    "remedy": {
      "type": "string"
    },
    "reportReceivedDate": {
      "type": "string"
    },
    "summary": {
      "type": "string"
    }
  },
  "required": [
    "manufacturer",
    "NHTSACampaignNumber",
    "parkIt",
    "parkOutSide",
    "overTheAirUpdate",
    "reportReceivedDate",
    "component",
    "summary",
    "consequence",
    "remedy",
    "notes",
    "modelYear",
    "make",
    "model"
  ],
  "type": "object"
}

/** RecallsResponse */
export interface RecallsResponse {
  "additionalProperties": false,
  "properties": {
    "data": {
      "items": {
        "$ref": "#/components/schemas/Recalls"
      },
      "type": "array"
    },
    "success": {
      "type": "boolean"
    }
  },
  "required": [
    "success",
    "data"
  ],
  "type": "object"
}

/** RoadsideAssistance */
export interface RoadsideAssistance {
  "type": [
    "boolean",
    "string"
  ]
}

/** Row */
export interface Row {
  "additionalProperties": {
    "anyOf": [
      {
        "type": "string"
      },
      {
        "type": "number"
      },
      {
        "type": "boolean"
      },
      {
        "type": "object"
      }
    ]
  },
  "description": "Represents a single row in Clickhouse.\n\nThis is a generic type, and can be used to represent any row in any table.",
  "examples": [
    {
      "make": "Honda",
      "model": "Accord",
      "nested": {
        "key": "value"
      },
      "vin": "1HGCM...",
      "year": 2021
    }
  ],
  "type": "object"
}

/** SellerType */
export interface SellerType {
  "type": "string"
}

/** Services */
export interface Services {
  "additionalProperties": false,
  "properties": {
    "buyVehicle": {
      "type": "string"
    },
    "connectYourVehicle": {
      "type": "string"
    },
    "financeInsurance": {
      "type": "string"
    },
    "getPreApproved": {
      "type": "string"
    },
    "getVehicleServiceContract": {
      "type": "string"
    },
    "inspectVehicle": {
      "type": "string"
    },
    "insureVehicle": {
      "type": "string"
    },
    "transportVehicle": {
      "type": "string"
    }
  },
  "required": [
    "inspectVehicle",
    "transportVehicle",
    "connectYourVehicle",
    "getPreApproved",
    "insureVehicle",
    "financeInsurance",
    "buyVehicle",
    "getVehicleServiceContract"
  ],
  "type": "object"
}

/** Shipping */
export interface Shipping {
  "additionalProperties": false,
  "properties": {
    "errors": {
      "items": {
        "type": "string"
      },
      "type": "array"
    }
  },
  "required": [
    "errors"
  ],
  "type": "object"
}

/** Source */
export interface Source {
  "type": "string"
}

/** Specs */
export interface Specs {
  "additionalProperties": false,
  "properties": {
    "color": {
      "$ref": "#/components/schemas/Color"
    },
    "edmundsTypeCategories": {
      "$ref": "#/components/schemas/EdmundsTypeCategories"
    },
    "features": {
      "$ref": "#/components/schemas/SpecsFeatures"
    },
    "name": {
      "type": "string"
    },
    "orderedFeatures": {
      "items": {
        "$ref": "#/components/schemas/OrderedFeature"
      },
      "type": "array"
    },
    "price": {
      "$ref": "#/components/schemas/Price"
    },
    "styleAttributes": {
      "$ref": "#/components/schemas/StyleAttributes"
    },
    "totalSeating": {
      "type": "number"
    }
  },
  "required": [
    "name",
    "price",
    "totalSeating",
    "color",
    "features",
    "orderedFeatures",
    "edmundsTypeCategories",
    "styleAttributes"
  ],
  "type": "object"
}

/** SpecsFeatures */
export interface SpecsFeatures {
  "additionalProperties": false,
  "properties": {
    "comfortConvenience": {
      "additionalProperties": {
        "type": "boolean"
      },
      "type": "object"
    },
    "driveTrain": {
      "$ref": "#/components/schemas/DriveTrain"
    },
    "engine": {
      "$ref": "#/components/schemas/Engine"
    },
    "exteriorOptions": {
      "additionalProperties": {
        "type": "boolean"
      },
      "type": "object"
    },
    "frontseats": {
      "$ref": "#/components/schemas/Frontseats"
    },
    "fuel": {
      "$ref": "#/components/schemas/Fuel"
    },
    "inCarEntertainment": {
      "$ref": "#/components/schemas/InCarEntertainment"
    },
    "instrumentation": {
      "$ref": "#/components/schemas/Instrumentation"
    },
    "interiorOptions": {
      "$ref": "#/components/schemas/InteriorOptions"
    },
    "measurements": {
      "$ref": "#/components/schemas/Measurements"
    },
    "mechanicalOptions": {
      "$ref": "#/components/schemas/MechanicalOptions"
    },
    "packages": {
      "additionalProperties": {
        "type": "boolean"
      },
      "type": "object"
    },
    "powerFeature": {
      "$ref": "#/components/schemas/PowerFeature"
    },
    "rearseats": {
      "$ref": "#/components/schemas/Rearseats"
    },
    "safety": {
      "additionalProperties": {
        "type": "boolean"
      },
      "type": "object"
    },
    "suspension": {
      "$ref": "#/components/schemas/Suspension"
    },
    "telematics": {
      "$ref": "#/components/schemas/Telematics"
    },
    "tiresAndWheels": {
      "$ref": "#/components/schemas/TiresAndWheels"
    },
    "warranty": {
      "$ref": "#/components/schemas/Warranty"
    }
  },
  "required": [
    "powerFeature",
    "mechanicalOptions",
    "rearseats",
    "warranty",
    "measurements",
    "comfortConvenience",
    "exteriorOptions",
    "driveTrain",
    "suspension",
    "instrumentation",
    "inCarEntertainment",
    "frontseats",
    "packages",
    "fuel",
    "telematics",
    "safety",
    "tiresAndWheels",
    "engine",
    "interiorOptions"
  ],
  "type": "object"
}

/** SpecsResponse */
export interface SpecsResponse {
  "additionalProperties": false,
  "properties": {
    "specs": {
      "$ref": "#/components/schemas/Specs"
    },
    "vehicle": {
      "$ref": "#/components/schemas/Vehicle"
    }
  },
  "required": [
    "vehicle",
    "specs"
  ],
  "type": "object"
}

/** State */
export interface State {
  "$ref": "#/components/schemas/States"
}

/** States */
export interface States {
  "enum": [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC"
  ],
  "type": "string"
}

/** StyleAttributes */
export interface StyleAttributes {
  "additionalProperties": false,
  "properties": {
    "electric": {
      "type": "boolean"
    },
    "pluginElectric": {
      "type": "boolean"
    },
    "truck": {
      "type": "boolean"
    }
  },
  "required": [
    "truck",
    "electric",
    "pluginElectric"
  ],
  "type": "object"
}

/** Suspension */
export interface Suspension {
  "additionalProperties": {
    "type": "boolean"
  },
  "type": "object"
}

/** TLSClientAuth */
export interface TLSClientAuth {
  "additionalProperties": false,
  "properties": {
    "certFingerprintSHA1": {
      "type": "string"
    },
    "certFingerprintSHA256": {
      "type": "string"
    },
    "certIssuerDN": {
      "type": "string"
    },
    "certIssuerDNLegacy": {
      "type": "string"
    },
    "certIssuerDNRFC2253": {
      "type": "string"
    },
    "certIssuerSKI": {
      "type": "string"
    },
    "certIssuerSerial": {
      "type": "string"
    },
    "certNotAfter": {
      "type": "string"
    },
    "certNotBefore": {
      "type": "string"
    },
    "certPresented": {
      "type": "string"
    },
    "certRevoked": {
      "type": "string"
    },
    "certSKI": {
      "type": "string"
    },
    "certSerial": {
      "type": "string"
    },
    "certSubjectDN": {
      "type": "string"
    },
    "certSubjectDNLegacy": {
      "type": "string"
    },
    "certSubjectDNRFC2253": {
      "type": "string"
    },
    "certVerified": {
      "type": "string"
    }
  },
  "required": [
    "certIssuerDNLegacy",
    "certIssuerSKI",
    "certSubjectDNRFC2253",
    "certSubjectDNLegacy",
    "certFingerprintSHA256",
    "certNotBefore",
    "certSKI",
    "certSerial",
    "certIssuerDN",
    "certVerified",
    "certNotAfter",
    "certSubjectDN",
    "certPresented",
    "certRevoked",
    "certIssuerSerial",
    "certIssuerDNRFC2253",
    "certFingerprintSHA1"
  ],
  "type": "object"
}

/** TLSExportedAuthenticator */
export interface TLSExportedAuthenticator {
  "additionalProperties": false,
  "properties": {
    "clientFinished": {
      "type": "string"
    },
    "clientHandshake": {
      "type": "string"
    },
    "serverFinished": {
      "type": "string"
    },
    "serverHandshake": {
      "type": "string"
    }
  },
  "required": [
    "clientFinished",
    "clientHandshake",
    "serverHandshake",
    "serverFinished"
  ],
  "type": "object"
}

/** Taxes */
export interface Taxes {
  "additionalProperties": false,
  "properties": {
    "combinedSalesTax": {
      "type": "number"
    },
    "gasGuzzlerTax": {
      "type": "number"
    },
    "stateSalesTax": {
      "type": "number"
    }
  },
  "required": [
    "combinedSalesTax",
    "stateSalesTax",
    "gasGuzzlerTax"
  ],
  "type": "object"
}

/** TaxesQuery */
export interface TaxesQuery {
  "additionalProperties": false,
  "properties": {
    "tradeIn": {
      "description": "Change the Trade-In value of the vehicle, if applicable.",
      "type": "number"
    },
    "zip": {
      "description": "Change the ZIP code to calculate taxes and fees for a different location.",
      "type": "string"
    }
  },
  "required": [
    "zip",
    "tradeIn"
  ],
  "type": "object"
}

/** TaxesResponse */
export interface TaxesResponse {
  "additionalProperties": false,
  "properties": {
    "criteria": {
      "$ref": "#/components/schemas/Criteria"
    },
    "data": {
      "$ref": "#/components/schemas/Data"
    },
    "fees": {
      "$ref": "#/components/schemas/Fees"
    },
    "links": {
      "$ref": "#/components/schemas/Links"
    },
    "services": {
      "$ref": "#/components/schemas/Services"
    },
    "taxes": {
      "$ref": "#/components/schemas/Taxes"
    },
    "totalTaxesAndFees": {
      "type": "number"
    },
    "vehicle": {
      "$ref": "#/components/schemas/Vehicle"
    }
  },
  "required": [
    "vehicle",
    "criteria",
    "totalTaxesAndFees",
    "taxes",
    "fees",
    "links",
    "data",
    "services"
  ],
  "type": "object"
}

/** Telematics */
export interface Telematics {
  "additionalProperties": {
    "type": "boolean"
  },
  "type": "object"
}

/** Terior */
export interface Terior {
  "additionalProperties": false,
  "properties": {
    "name": {
      "type": "string"
    },
    "rgb": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "rgb"
  ],
  "type": "object"
}

/** TiresAndWheels */
export interface TiresAndWheels {
  "additionalProperties": {
    "type": "boolean"
  },
  "type": "object"
}

/** Transport */
export interface Transport {
  "additionalProperties": false,
  "properties": {
    "distance": {
      "type": "number"
    },
    "eta": {
      "$ref": "#/components/schemas/Eta"
    },
    "expiration": {
      "format": "date-time",
      "type": "string"
    },
    "fromZip": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "toZip": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "fromZip",
    "toZip",
    "price",
    "eta",
    "distance",
    "expiration"
  ],
  "type": "object"
}

/** TransportResponse */
export interface TransportResponse {
  "additionalProperties": false,
  "properties": {
    "transport": {
      "$ref": "#/components/schemas/Transport"
    },
    "vehicle": {
      "$ref": "#/components/schemas/Vehicle"
    }
  },
  "required": [
    "vehicle",
    "transport"
  ],
  "type": "object"
}

/** Ua */
export interface Ua {
  "additionalProperties": false,
  "properties": {
    "browser": {
      "$ref": "#/components/schemas/Browser"
    },
    "cpu": {
      "$ref": "#/components/schemas/CPU"
    },
    "device": {
      "$ref": "#/components/schemas/Query"
    },
    "engine": {
      "$ref": "#/components/schemas/Engine"
    },
    "os": {
      "$ref": "#/components/schemas/Engine"
    },
    "ua": {
      "type": "string"
    }
  },
  "required": [
    "ua",
    "browser",
    "engine",
    "os",
    "device",
    "cpu"
  ],
  "type": "object"
}

/** Vehicle */
export interface Vehicle {
  "additionalProperties": false,
  "properties": {
    "make": {
      "type": "string"
    },
    "manufacturer": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "vin": {
      "type": "string"
    },
    "year": {
      "type": "number"
    }
  },
  "required": [
    "vin",
    "year",
    "make",
    "model",
    "manufacturer"
  ],
  "type": "object"
}

/** VehicleAgeType */
export interface VehicleAgeType {
  "type": "string"
}

/** Vsc */
export interface Vsc {
  "additionalProperties": false,
  "properties": {
    "rates": {
      "$ref": "#/components/schemas/VscRates"
    },
    "requestBody": {
      "type": "string"
    }
  },
  "required": [
    "rates",
    "requestBody"
  ],
  "type": "object"
}

/** VscAPI */
export interface VscAPI {
  "additionalProperties": false,
  "properties": {
    "description": {
      "type": "string"
    },
    "endpoints": {
      "$ref": "#/components/schemas/Endpoints"
    },
    "icon": {
      "type": "string"
    },
    "login": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "repo": {
      "type": "string"
    },
    "signup": {
      "type": "string"
    },
    "site": {
      "type": "string"
    },
    "subscribe": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "url": {
      "type": "string"
    }
  },
  "required": [
    "icon",
    "name",
    "description",
    "url",
    "type",
    "endpoints",
    "site",
    "login",
    "signup",
    "subscribe",
    "repo"
  ],
  "type": "object"
}

/** VscRates */
export interface VscRates {
  "additionalProperties": false,
  "properties": {
    "containers": {
      "items": {},
      "type": "array"
    },
    "correlationID": {
      "type": "string"
    },
    "manufactureWarranties": {
      "items": {},
      "type": "array"
    },
    "rates": {
      "items": {
        "$ref": "#/components/schemas/Rate"
      },
      "type": "array"
    },
    "totalRecordCount": {
      "type": "number"
    },
    "vehicle": {
      "additionalProperties": false,
      "properties": {
        "inServiceDate": {
          "format": "date-time",
          "type": "string"
        },
        "make": {
          "type": "string"
        },
        "model": {
          "type": "string"
        },
        "properties": {
          "$ref": "#/components/schemas/Properties"
        },
        "vehicleAgeType": {
          "type": "string"
        },
        "vehicleType": {
          "type": "string"
        },
        "vehicleYear": {
          "type": "number"
        },
        "vin": {
          "type": "string"
        }
      },
      "required": [
        "vin",
        "vehicleAgeType",
        "inServiceDate",
        "properties",
        "vehicleType",
        "make",
        "model",
        "vehicleYear"
      ],
      "type": "object"
    }
  },
  "required": [
    "vehicle",
    "rates",
    "containers",
    "manufactureWarranties",
    "totalRecordCount",
    "correlationID"
  ],
  "type": "object"
}

/** Warranty */
export interface Warranty {
  "additionalProperties": false,
  "properties": {
    "basic": {
      "type": "string"
    },
    "drivetrain": {
      "type": "string"
    },
    "freeMaintenance": {
      "type": "string"
    },
    "roadsideAssistance": {
      "type": "string"
    },
    "rust": {
      "type": "string"
    }
  },
  "required": [
    "basic",
    "drivetrain",
    "freeMaintenance",
    "rust",
    "roadsideAssistance"
  ],
  "type": "object"
}

// ── Request Parameter Types ─────────────────────────────────────────

/** GET /listings/{vin} query parameters */
export interface ListingsVinParams {
  /** Search radius in miles (default: 50) */
  distance?: number
  /** Comma-separated includes, e.g. "facets" */
  includes?: string
  /** Results per page (default: 100) */
  limit?: number
  /** Page number (default: 1) */
  page?: number
  /** Filter by mileage */
  'retailListing.miles'?: string
  /** Filter by price */
  'retailListing.price'?: string
  /** Sort field and direction, e.g. "price:desc", "mileage:asc", "year:desc" */
  sort?: string
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
// GET /openrecalls/{vin}
// GET /taxes/{vin}

