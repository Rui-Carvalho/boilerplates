from marshmallow import post_load

from .transaction import Transaction, TransactionSchema
from .transaction_type import TransactionType


class Income(Transaction):
    def __init__(self, description, amount):
        super(Income, self).__init__(description, amount, TransactionType.INCOME)

    def __repr__(self):
        return '<Income(name={self.description!r})>'.format(self=self)

    def change_amount(self, amount):
        amount = abs(amount)
        self.amount = amount


class IncomeSchema(TransactionSchema):
    @post_load
    def make_income(self, data):
        # Let's use argument unpacking syntax (**list_variable)
        return Income(**data)
