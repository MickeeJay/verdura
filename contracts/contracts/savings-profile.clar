;; savings-profile.clar

;; Error Constants
(define-constant err-unauthorized (err u300))
(define-constant err-profile-not-found (err u301))
(define-constant err-already-exists (err u302))

;; Data Maps
(define-map profiles
  principal
  {
    total-vaults-completed: uint,
    total-saved: uint,
    total-yield-earned: uint,
    member-since: uint,
    last-vault-block: uint
  }
)

;; Public Functions
(define-public (record-deposit (owner principal) (_vault-id uint) (amount uint))
  (begin
    (asserts! (is-eq contract-caller .savings-vault) err-unauthorized)
    (match (map-get? profiles owner)
      profile
      (map-set profiles owner
        (merge profile {
          total-saved: (+ (get total-saved profile) amount)
        })
      )
      (map-set profiles owner
        {
          total-vaults-completed: u0,
          total-saved: amount,
          total-yield-earned: u0,
          member-since: block-height,
          last-vault-block: u0
        }
      )
    )
    (ok true)
  )
)

(define-public (record-withdrawal (owner principal) (vault-id uint) (amount uint) (yield-earned uint))
  (begin
    (asserts! (is-eq contract-caller .savings-vault) err-unauthorized)
    (let
      (
        (profile (unwrap! (map-get? profiles owner) err-profile-not-found))
      )
      (map-set profiles owner
        (merge profile {
          total-vaults-completed: (+ (get total-vaults-completed profile) u1),
          total-yield-earned: (+ (get total-yield-earned profile) yield-earned),
          last-vault-block: block-height
        })
      )
      (ok true)
    )
  )
)

(define-read-only (get-profile (owner principal))
  (map-get? profiles owner)
)

(define-read-only (get-total-saved (owner principal))
  (match (map-get? profiles owner)
    profile (ok (get total-saved profile))
    (ok u0)
  )
)

(define-read-only (is-member (owner principal))
  (is-some (map-get? profiles owner))
)

(define-read-only (get-leaderboard-score (owner principal))
  (match (map-get? profiles owner)
    profile
    (+ (* (get total-vaults-completed profile) u100) (/ (get total-saved profile) u1000))
    u0
  )
)

(define-read-only (get-savings-streak (owner principal))
  (match (map-get? profiles owner)
    profile
    (let
      (
        (last-block (get last-vault-block profile))
      )
      (if (is-eq last-block u0)
        u0
        (if (<= (- block-height last-block) u4320)
          (get total-vaults-completed profile)
          u0
        )
      )
    )
    u0
  )
)

