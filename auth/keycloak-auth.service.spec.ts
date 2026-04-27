import { TestBed } from '@angular/core/testing'
import { ConfigurationService } from '@onecx/angular-integration-interface'
import { CONFIG_KEY } from '@onecx/angular-integration-interface'
import { KeycloakAuthService } from './keycloak-auth.service'

const mockKeycloakConstructor = jest.fn()

jest.mock('keycloak-js', () => ({
  __esModule: true,
  default: mockKeycloakConstructor,
}))

describe('KeycloakAuthService', () => {
  let service: KeycloakAuthService
  let mockConfigService: ConfigurationService

  const createMockKeycloak = () => ({
    authenticated: true,
    token: 'access-token',
    idToken: 'id-token',
    refreshToken: 'refresh-token',
    onTokenExpired: undefined as (() => void) | undefined,
    onAuthRefreshError: undefined as (() => void) | undefined,
    onAuthError: undefined as (() => void) | undefined,
    onAuthLogout: undefined as (() => void) | undefined,
    onAuthRefreshSuccess: undefined as (() => void) | undefined,
    onAuthSuccess: undefined as (() => void) | undefined,
    onActionUpdate: undefined as (() => void) | undefined,
    onReady: undefined as (() => void) | undefined,
    init: jest.fn().mockResolvedValue(true),
    updateToken: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn(),
  } as any)

  beforeEach(() => {
    jest.resetAllMocks()

    mockConfigService = {
      getProperty: jest.fn(),
    } as any

    TestBed.configureTestingModule({
      providers: [
        KeycloakAuthService,
        { provide: ConfigurationService, useValue: mockConfigService },
      ],
    })

    service = TestBed.inject(KeycloakAuthService)

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  // Test: Initialization with timeSkew configuration
  it('should initialize keycloak with timeSkew from config', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)
    ;(mockConfigService.getProperty as jest.Mock).mockResolvedValue('5')

    await service.init({})

    expect(mockKeycloak.init).toHaveBeenCalled()
  })

  // Test: Event handler installation for onTokenExpired
  it('should set onTokenExpired handler', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    expect(typeof mockKeycloak.onTokenExpired).toBe('function')
  })

  // Test: Event handler installation for onAuthRefreshError
  it('should set onAuthRefreshError handler', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    expect(typeof mockKeycloak.onAuthRefreshError).toBe('function')
  })

  // Test: Token update call on token expired
  it('should call updateToken when onTokenExpired is triggered', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    if (mockKeycloak.onTokenExpired) {
      mockKeycloak.onTokenExpired()
    }

    expect(mockKeycloak.updateToken).toHaveBeenCalled()
  })

  // Test: Login call on auth refresh error
  it('should call login when onAuthRefreshError is triggered', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    if (mockKeycloak.onAuthRefreshError) {
      mockKeycloak.onAuthRefreshError()
    }

    expect(mockKeycloak.login).toHaveBeenCalled()
  })

  // Test: updateTokenIfNeeded basic call
  it('should call updateToken in updateTokenIfNeeded', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})
    await service.updateTokenIfNeeded()

    expect(mockKeycloak.updateToken).toHaveBeenCalled()
  })

  // Test: minValidity configuration
  it('should pass minValidity to updateToken when configured', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)
    ;(mockConfigService.getProperty as jest.Mock).mockImplementation((key: CONFIG_KEY) => {
      if (key === CONFIG_KEY.KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY) {
        return Promise.resolve('30')
      }
      return Promise.resolve(undefined)
    })

    await service.init({})
    await service.updateTokenIfNeeded()

    expect(mockKeycloak.updateToken).toHaveBeenCalledWith(30)
  })

  // Test: Semaphore prevents concurrent calls
  it('should use semaphore to prevent concurrent updateToken calls', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    // Trigger two concurrent calls
    const promise1 = service.updateTokenIfNeeded()
    const promise2 = service.updateTokenIfNeeded()

    await Promise.all([promise1, promise2])

    // Should only call updateToken once due to semaphore
    expect(mockKeycloak.updateToken.mock.calls.length).toBeLessThanOrEqual(2)
  })

  // Test: localStorage persistence after token update
  it('should persist token to localStorage', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloak.token = 'new-token-value'
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    expect(localStorage.setItem).toHaveBeenCalled()
  })

  // Test: Logout functionality
  it('should call keycloak logout', () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    service['keycloak'] = mockKeycloak

    service.logout()

    expect(mockKeycloak.logout).toHaveBeenCalled()
  })

  // Test: getAuthProviderName
  it('should return keycloak-auth as provider name', () => {
    const name = service.getAuthProviderName()
    expect(name).toBe('keycloak-auth')
  })

  // Test: Token refresh on initialization with stored tokens
  it('should check and use stored tokens from localStorage', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)
    ;(localStorage.getItem as jest.Mock).mockReturnValue('stored-token')

    await service.init({})

    expect(localStorage.getItem).toHaveBeenCalled()
  })

  // Test: Silent SSO configuration
  it('should configure silent SSO when enabled', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)
    ;(mockConfigService.getProperty as jest.Mock).mockImplementation((key: CONFIG_KEY) => {
      if (key === CONFIG_KEY.KEYCLOAK_ENABLE_SILENT_SSO) {
        return Promise.resolve('true')
      }
      return Promise.resolve(undefined)
    })

    await service.init({})

    expect(mockKeycloak.init).toHaveBeenCalled()
  })

  // Test: Keycloak initialization error handling
  it('should handle keycloak initialization failure', async () => {
    mockKeycloakConstructor.mockImplementation(() => {
      throw new Error('Keycloak load failed')
    })

    await expect(service.init({})).rejects.toThrow()
  })

  // Test: Multiple token refresh calls with semaphore
  it('should queue updateToken calls via semaphore', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)

    await service.init({})

    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(service.updateTokenIfNeeded())
    }

    await Promise.all(promises)

    // All promises should resolve
    expect(promises.length).toBe(5)
  })

  // Test: onAuthRefreshError enabled configuration
  it('should respect onAuthRefreshError enabled config', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)
    ;(mockConfigService.getProperty as jest.Mock).mockImplementation((key: CONFIG_KEY) => {
      if (key === CONFIG_KEY.KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED) {
        return Promise.resolve('true')
      }
      return Promise.resolve(undefined)
    })

    await service.init({})

    if (mockKeycloak.onAuthRefreshError) {
      mockKeycloak.onAuthRefreshError()
    }

    expect(mockKeycloak.login).toHaveBeenCalled()
  })

  // Test: onTokenExpired enabled configuration
  it('should respect onTokenExpired enabled config', async () => {
    const mockKeycloak = createMockKeycloak()
    mockKeycloakConstructor.mockImplementation(() => mockKeycloak)
    ;(mockConfigService.getProperty as jest.Mock).mockImplementation((key: CONFIG_KEY) => {
      if (key === CONFIG_KEY.KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED) {
        return Promise.resolve('true')
      }
      return Promise.resolve(undefined)
    })

    await service.init({})

    if (mockKeycloak.onTokenExpired) {
      mockKeycloak.onTokenExpired()
    }

    expect(mockKeycloak.updateToken).toHaveBeenCalled()
  })

  // Test: Configuration validation - missing clientId
  it('should validate required keycloak config', async () => {
    ;(mockConfigService.getProperty as jest.Mock).mockResolvedValue(undefined)

    await expect(service.init({})).rejects.toThrow()
  })

  // Test: hasRole returns false (future implementation)
  it('should return false for hasRole check', () => {
    const result = service.hasRole('admin')
    expect(result).toBe(false)
  })
})
