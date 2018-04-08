import unittest
from unittest.mock import patch
from cashman.model.income import Income, IncomeSchema


class TestIncome(unittest.TestCase):

    # Runs BEFORE all tests... class Methods belong to the class, not the instance of the class
    @classmethod
    def setUpClass(cls):
        print('\nSetting up class...\n\n')

    # Runs AFTER all tests
    @classmethod
    def tearDownClass(cls):
        print('\nTearing down class...')

    # Runs BEFORE each test
    def setUp(self):
        print("\nRun before test...")
        self.incomeSalary = Income('Salary', 5000)
        pass

    # Runs AFTER each test
    def tearDown(self):
        print("Run after test...")
        pass

    def test_change_amount(self):
        print("Running test: test_change_amount")
        self.assertEqual(self.incomeSalary.amount, 5000)
        self.incomeSalary.change_amount(10000)
        self.assertEqual(self.incomeSalary.amount, 10000)

    # def test_mock_example(self):
    #     print("Running test: test_mock_example")
    #     # We will mock requests.get only where it is being used, ie, in calc module
    #     with patch('calc.requests.get') as mocked_get:
    #
    #         # Testing for a successful request
    #         mocked_get.return_value.ok = True
    #         mocked_get.return_value.text = 'Success'
    #
    #         something = calc.mock_example('rui', 'carvalho')
    #         mocked_get.assert_called_with('http://company.com/rui/carvalho')
    #         self.assertEqual(something, 'Success')
    #
    #         # Testing for failured request
    #         mocked_get.return_value.ok = False
    #
    #         something = calc.mock_example('rui', 'carvalho')
    #         mocked_get.assert_called_with('http://company.com/rui/carvalho')
    #         self.assertEqual(something, 'Bad response')


if __name__ == '__main__':
    unittest.main()
