;; yield-router.clar

;; Error Constants
(define-constant err-unauthorized (err u200))
(define-constant err-unsupported-token (err u201))
(define-constant err-zero-amount (err u202))
(define-constant err-router-paused (err u203))

;; Data Maps
(define-map supported-tokens principal bool)

(define-map yield-positions
  { vault-id: uint, owner: principal }
  {
    shares: uint,
    deposited-amount: uint,
    deposit-block: uint
  }
)

;; Data Variables
(define-data-var router-paused bool false)
(define-data-var total-shares-issued uint u0)
(define-data-var total-assets-managed uint u0)
(define-data-var last-yield-block uint u0)
(define-data-var contract-owner principal tx-sender)

;; Public Functions
(define-public (route-to-yield (vault-id uint) (amount uint) (owner principal))
  (begin
    (asserts! (not (var-get router-paused)) err-router-paused)
    (asserts! (> amount u0) err-zero-amount)
    (asserts! (default-to false (map-get? supported-tokens contract-caller)) err-unsupported-token)
    
    ;; First accrue yield globally
    (accrue-yield)
    
    (let
      (
        (total-shares (var-get total-shares-issued))
        (total-assets (var-get total-assets-managed))
        (shares-minted
          (if (or (is-eq total-shares u0) (is-eq total-assets u0))
            amount
            (/ (* amount total-shares) total-assets)
          )
        )
        (existing-position (default-to { shares: u0, deposited-amount: u0, deposit-block: u0 } (map-get? yield-positions { vault-id: vault-id, owner: owner })))
        (new-shares (+ (get shares existing-position) shares-minted))
        (new-deposited (+ (get deposited-amount existing-position) amount))
      )
      (map-set yield-positions
        { vault-id: vault-id, owner: owner }
        {
          shares: new-shares,
          deposited-amount: new-deposited,
          deposit-block: block-height
        }
      )
      (var-set total-shares-issued (+ total-shares shares-minted))
      (var-set total-assets-managed (+ total-assets amount))
      (ok shares-minted)
    )
  )
)

(define-public (withdraw-from-yield (vault-id uint) (owner principal))
  (begin
    (asserts! (not (var-get router-paused)) err-router-paused)
    (asserts! (default-to false (map-get? supported-tokens contract-caller)) err-unsupported-token)
    ;; First accrue yield globally
    (accrue-yield)
    
    (let
      (
        (position (unwrap! (map-get? yield-positions { vault-id: vault-id, owner: owner }) err-zero-amount))
        (shares (get shares position))
        (total-shares (var-get total-shares-issued))
        (total-assets (var-get total-assets-managed))
        (redemption-amount (/ (* shares total-assets) total-shares))
      )
      (asserts! (> shares u0) err-zero-amount)
      
      ;; Transfer STX from yield-router to savings-vault (contract-caller)
      (try! (as-contract (stx-transfer? redemption-amount tx-sender contract-caller)))
      
      ;; Delete position
      (map-delete yield-positions { vault-id: vault-id, owner: owner })
      
      ;; Burn shares globally
      (var-set total-shares-issued (- total-shares shares))
      (var-set total-assets-managed (- total-assets redemption-amount))
      
      (ok redemption-amount)
    )
  )
)

(define-private (accrue-yield)
  (let
    (
      (last-block (var-get last-yield-block))
      (current-assets (var-get total-assets-managed))
    )
    (if (is-eq last-block u0)
      (begin
        (var-set last-yield-block block-height)
        true
      )
      (if (and (> block-height last-block) (> current-assets u0))
        (let
          (
            (elapsed-blocks (- block-height last-block))
            (yield-amount (simulate-yield current-assets elapsed-blocks))
          )
          (var-set total-assets-managed (+ current-assets yield-amount))
          (var-set last-yield-block block-height)
          true
        )
        (begin
          (var-set last-yield-block block-height)
          true
        )
      )
    )
  )
)

(define-read-only (simulate-yield (amount uint) (blocks uint))
  (/ (* amount blocks u8) u5256000)
)

(define-read-only (get-yield-balance (token principal) (owner principal))
  (ok u0)
)

(define-public (pause-router)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (var-set router-paused true)
    (ok true)
  )
)

(define-public (resume-router)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (var-set router-paused false)
    (ok true)
  )
)

(define-public (set-supported-token (token principal) (supported bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (map-set supported-tokens token supported)
    (ok true)
  )
)

(define-read-only (get-router-stats)
  (let
    (
      (last-block (var-get last-yield-block))
      (current-assets (var-get total-assets-managed))
      (accrued-assets
        (if (is-eq last-block u0)
          current-assets
          (if (and (> block-height last-block) (> current-assets u0))
            (let
              (
                (elapsed-blocks (- block-height last-block))
                (yield-amount (simulate-yield current-assets elapsed-blocks))
              )
              (+ current-assets yield-amount)
            )
            current-assets
          )
        )
      )
    )
    {
      total-shares: (var-get total-shares-issued),
      total-assets: accrued-assets,
      is-paused: (var-get router-paused)
    }
  )
)

