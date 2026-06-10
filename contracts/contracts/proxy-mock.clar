;; proxy-mock.clar
;; Used strictly for testing contract-caller verification in vitest unit tests.

(define-public (call-deposit (vault-id uint) (amount uint))
  (contract-call? .savings-vault deposit vault-id amount)
)

(define-public (call-withdraw (vault-id uint))
  (contract-call? .savings-vault withdraw vault-id)
)

(define-public (call-pause-router)
  (contract-call? .yield-router pause-router)
)

(define-public (call-resume-router)
  (contract-call? .yield-router resume-router)
)

(define-public (call-set-supported-token (token principal) (supported bool))
  (contract-call? .yield-router set-supported-token token supported)
)
