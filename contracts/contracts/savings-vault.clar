;; savings-vault.clar

(define-trait sip-010-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-name () (response (string-ascii 32) uint))
    (get-symbol () (response (string-ascii 32) uint))
    (get-decimals () (response uint uint))
    (get-balance (principal) (response uint uint))
    (get-total-supply () (response uint uint))
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)
;; Error Constants
(define-constant err-unauthorized (err u100))
(define-constant err-not-found (err u102))
(define-constant err-vault-locked (err u103))
(define-constant err-vault-matured (err u104))
(define-constant err-invalid-amount (err u106))
(define-constant err-invalid-duration (err u107))

;; Data Maps
(define-map vaults
  { owner: principal, vault-id: uint }
  {
    name: (string-ascii 64),
    principal-amount: uint,
    start-block: uint,
    end-block: uint,
    is-active: bool,
    yield-enabled: bool,
    yield-shares: uint
  }
)

;; Data Variables
(define-data-var next-vault-id uint u1)

;; Public Functions
(define-public (create-vault (name (string-ascii 64)) (duration-blocks uint) (yield-enabled bool))
  (let
    (
      (vault-id (var-get next-vault-id))
    )
    (asserts! (is-eq contract-caller tx-sender) err-unauthorized)
    (asserts! (> (len name) u0) err-invalid-amount)
    (asserts! (and (>= duration-blocks u144) (<= duration-blocks u52560)) err-invalid-duration)

    (map-insert vaults
      { owner: tx-sender, vault-id: vault-id }
      {
        name: name,
        principal-amount: u0,
        start-block: block-height,
        end-block: (+ block-height duration-blocks),
        is-active: true,
        yield-enabled: yield-enabled,
        yield-shares: u0
      }
    )
    
    (var-set next-vault-id (+ vault-id u1))
    (ok vault-id)
  )
)

(define-public (deposit (vault-id uint) (amount uint))
  (let
    (
      (vault (unwrap! (map-get? vaults { owner: tx-sender, vault-id: vault-id }) err-not-found))
    )
    (asserts! (is-eq tx-sender tx-sender) err-unauthorized)
    (asserts! (get is-active vault) err-vault-locked)
    (asserts! (> amount u0) err-invalid-amount)

    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (if (get yield-enabled vault)
      (begin
        (try! (as-contract (stx-transfer? amount tx-sender .yield-router)))
        (let
          (
            (shares (unwrap! (contract-call? .yield-router route-to-yield vault-id amount tx-sender) err-unauthorized))
          )
          (map-set vaults
            { owner: tx-sender, vault-id: vault-id }
            (merge vault { 
              principal-amount: (+ (get principal-amount vault) amount),
              yield-shares: (+ (get yield-shares vault) shares)
            })
          )
          (unwrap! (contract-call? .savings-profile record-deposit tx-sender vault-id amount) err-unauthorized)
          (ok true)
        )
      )
      (begin
        (map-set vaults
          { owner: tx-sender, vault-id: vault-id }
          (merge vault { principal-amount: (+ (get principal-amount vault) amount) })
        )
        (unwrap! (contract-call? .savings-profile record-deposit tx-sender vault-id amount) err-unauthorized)
        (ok true)
      )
    )
  )
)

;; @post-condition: Vault is marked inactive.
;; @post-condition: Principal amount (plus any yield) is transferred from contract to tx-sender.
;; @post-condition: Profile record-withdrawal is called.
(define-public (withdraw (vault-id uint))
  (let
    (
      (vault (unwrap! (map-get? vaults { owner: tx-sender, vault-id: vault-id }) err-not-found))
      (amount (get principal-amount vault))
      (caller tx-sender)
    )
    (asserts! (get is-active vault) err-vault-matured)
    (asserts! (>= block-height (get end-block vault)) err-vault-locked)

    (if (get yield-enabled vault)
      (let
        (
          (amount-redeemed (unwrap! (contract-call? .yield-router withdraw-from-yield vault-id caller) err-unauthorized))
        )
        (try! (as-contract (stx-transfer? amount-redeemed tx-sender caller)))
        (map-set vaults
          { owner: caller, vault-id: vault-id }
          (merge vault { is-active: false, yield-shares: u0 })
        )
        (unwrap! (contract-call? .savings-profile record-withdrawal caller amount-redeemed) err-unauthorized)
        (ok amount-redeemed)
      )
      (begin
        (try! (as-contract (stx-transfer? amount tx-sender caller)))
        (map-set vaults
          { owner: caller, vault-id: vault-id }
          (merge vault { is-active: false })
        )
        (unwrap! (contract-call? .savings-profile record-withdrawal caller amount) err-unauthorized)
        (ok amount)
      )
    )
  )
)

(define-read-only (get-vault (owner principal) (vault-id uint))
  (map-get? vaults { owner: owner, vault-id: vault-id })
)

(define-read-only (get-vault-count)
  (- (var-get next-vault-id) u1)
)

(define-read-only (get-maturity-block (owner principal) (vault-id uint))
  (match (map-get? vaults { owner: owner, vault-id: vault-id })
    vault (ok (get end-block vault))
    err-not-found
  )
)

(define-read-only (is-vault-mature (owner principal) (vault-id uint))
  (match (map-get? vaults { owner: owner, vault-id: vault-id })
    vault (ok (>= block-height (get end-block vault)))
    err-not-found
  )
)

(define-constant vault-ids-list 
  (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39 u40 u41 u42 u43 u44 u45 u46 u47 u48 u49 u50)
)

(define-private (accumulate-active-vault (vault-id uint) (state { owner: principal, active-vaults: (list 50 uint) }))
  (match (map-get? vaults { owner: (get owner state), vault-id: vault-id })
    vault (if (get is-active vault)
            { owner: (get owner state), active-vaults: (unwrap-panic (as-max-len? (append (get active-vaults state) vault-id) u50)) }
            state
          )
    state
  )
)

(define-read-only (get-all-vaults-by-owner (owner principal))
  (get active-vaults (fold accumulate-active-vault vault-ids-list { owner: owner, active-vaults: (list ) }))
)
