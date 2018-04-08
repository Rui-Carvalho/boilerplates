from flask import Flask, jsonify, request

from cashman.model.expense import Expense, ExpenseSchema
from cashman.model.income import Income, IncomeSchema
from cashman.model.transaction_type import TransactionType

app = Flask(__name__)

# Creates List or objects of type Income and Expense
transactions = [
    Income('Salary', 5000),
    Income('Dividends', 200),
    Expense('pizza', 50),
    Expense('Rock Concert', 100)
]


@app.route('/incomes')
def get_incomes():

    schema = IncomeSchema(many=True)

    # Serialize income object to native Python data types according to its Schema's fields.
    # We use a filter with a lambda function to get all objects of type INCOME from 'transactions' list var to serialize
    # Var 'incomes' is of type => tuple of the form (``data``, ``errors``)
    incomes = schema.dump(
        filter(lambda t: t.type == TransactionType.INCOME, transactions)
    )

    # Return the serialised data as JSON to the browser
    return jsonify(incomes.data)


@app.route('/incomes', methods=['POST'])
def add_income():

    # Load an instance of Income based on the JSON data sent by the user, ie,
    # deserializes the request JSON POST datastructure into an Income object using its schema
    income = IncomeSchema().load(request.get_json())

    # Add the new object to the list of transactions (see variable above)
    transactions.append(income.data)
    return "", 204


@app.route('/expenses')
def get_expenses():
    schema = ExpenseSchema(many=True)
    expenses = schema.dump(
        filter(lambda t: t.type == TransactionType.EXPENSE, transactions)
    )
    return jsonify(expenses.data)


@app.route('/expenses', methods=['POST'])
def add_expense():
    expense = ExpenseSchema().load(request.get_json())
    transactions.append(expense.data)
    return "", 204


if __name__ == "__main__":
    app.run()
