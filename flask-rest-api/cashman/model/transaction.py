import datetime as dt

from marshmallow import Schema, fields


class Transaction:
    def __init__(self, description, amount, t_type):
        self.description = description
        self.amount = amount
        self.created_at = dt.datetime.now()
        self.type = t_type

    def __repr__(self):
        return '<Transaction(name={self.description!r})>'.format(self=self)


# Class to deserialize and serialize instances of Transaction from and to JSON objects
# Inherits from marshmallow.Schema
class TransactionSchema(Schema):
    description = fields.Str()
    amount = fields.Number()
    created_at = fields.Date()
    type = fields.Str()
