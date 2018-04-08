from enum import Enum


class TransactionType(Enum):
    """TransactionType inherits from Enum and that defines two types: INCOME and EXPENSE"""
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
