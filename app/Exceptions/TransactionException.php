<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Domain error during checkout/void (insufficient stock, underpayment,
 * already-settled void). Carries a user-facing Indonesian message.
 */
class TransactionException extends RuntimeException {}
