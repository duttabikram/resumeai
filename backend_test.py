#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime

class AIPortfolioAPITester:
    def __init__(self, base_url="https://ai-portfolio-builder-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.test_portfolio_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        
        self.test_results.append(result)
        print(f"{status} - {test_name}: {message}")

    def make_request(self, method, endpoint, data=None, files=None, expect_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
        
        if files:
            headers.pop('Content-Type')  # Let requests set it for multipart
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers={k:v for k,v in headers.items() if k != 'Content-Type'}, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expect_status
            
            if success:
                try:
                    response_data = response.json()
                except:
                    response_data = response.text
            else:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('detail', f'HTTP {response.status_code}')
                except:
                    error_msg = f'HTTP {response.status_code} - {response.text[:100]}'
                response_data = error_msg

            return success, response_data
            
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_signup(self):
        """Test user signup"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_data = {
            "email": f"test_user_{timestamp}@test.com",
            "password": "TestPassword123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.make_request('POST', 'auth/signup', test_data, expect_status=200)
        
        if success:
            self.session_token = response.get('session_token')
            self.user_id = response.get('user', {}).get('user_id')
            self.log_result("User Signup", True, f"Created user: {test_data['email']}")
        else:
            self.log_result("User Signup", False, f"Failed: {response}")
        
        return success

    def test_login(self):
        """Test user login with existing account"""
        # We'll use the account created in signup
        if not hasattr(self, '_signup_email'):
            self.log_result("User Login", False, "Skipped - No signup email available")
            return False
            
        test_data = {
            "email": self._signup_email,
            "password": self._signup_password
        }
        
        success, response = self.make_request('POST', 'auth/login', test_data, expect_status=200)
        
        if success:
            self.log_result("User Login", True, "Login successful")
        else:
            self.log_result("User Login", False, f"Failed: {response}")
        
        return success

    def test_get_user_profile(self):
        """Test getting current user profile"""
        success, response = self.make_request('GET', 'auth/me')
        
        if success:
            user_data = response
            expected_fields = ['user_id', 'email', 'name', 'subscription_plan']
            missing_fields = [field for field in expected_fields if field not in user_data]
            
            if missing_fields:
                self.log_result("Get User Profile", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Get User Profile", True, f"Profile retrieved: {user_data.get('email')}")
        else:
            self.log_result("Get User Profile", False, f"Failed: {response}")
        
        return success

    def test_create_portfolio(self):
        """Test creating a portfolio"""
        test_data = {
            "name": f"Test Portfolio {datetime.now().strftime('%H%M%S')}",
            "bio": "This is a test portfolio created by automated testing",
            "role": "Test Developer",
            "skills": ["Python", "JavaScript", "Testing"],
            "projects": [
                {
                    "title": "Test Project",
                    "description": "A sample project for testing",
                    "tech_stack": ["Python", "FastAPI"],
                    "link": "https://example.com",
                    "github_link": "https://github.com/test/repo"
                }
            ],
            "education": [
                {
                    "degree": "B.S. Computer Science",
                    "institution": "Test University",
                    "year": "2020"
                }
            ],
            "experience": [
                {
                    "title": "Software Developer",
                    "company": "Test Company",
                    "duration": "2020-2023",
                    "description": "Developed test applications"
                }
            ],
            "template": "minimal",
            "theme_color": "#4F46E5"
        }
        
        success, response = self.make_request('POST', 'portfolios', test_data, expect_status=200)
        
        if success:
            self.test_portfolio_id = response.get('portfolio_id')
            self.log_result("Create Portfolio", True, f"Created portfolio: {response.get('name')}")
        else:
            self.log_result("Create Portfolio", False, f"Failed: {response}")
        
        return success

    def test_get_portfolios(self):
        """Test getting user's portfolios"""
        success, response = self.make_request('GET', 'portfolios')
        
        if success:
            portfolios = response
            self.log_result("Get Portfolios", True, f"Retrieved {len(portfolios)} portfolios")
        else:
            self.log_result("Get Portfolios", False, f"Failed: {response}")
        
        return success

    def test_get_single_portfolio(self):
        """Test getting a single portfolio"""
        if not self.test_portfolio_id:
            self.log_result("Get Single Portfolio", False, "Skipped - No portfolio ID available")
            return False
        
        success, response = self.make_request('GET', f'portfolios/{self.test_portfolio_id}')
        
        if success:
            portfolio = response
            self.log_result("Get Single Portfolio", True, f"Retrieved portfolio: {portfolio.get('name')}")
        else:
            self.log_result("Get Single Portfolio", False, f"Failed: {response}")
        
        return success

    def test_update_portfolio(self):
        """Test updating a portfolio"""
        if not self.test_portfolio_id:
            self.log_result("Update Portfolio", False, "Skipped - No portfolio ID available")
            return False
        
        update_data = {
            "name": f"Updated Test Portfolio {datetime.now().strftime('%H%M%S')}",
            "bio": "Updated bio with new information"
        }
        
        success, response = self.make_request('PUT', f'portfolios/{self.test_portfolio_id}', update_data)
        
        if success:
            self.log_result("Update Portfolio", True, f"Updated portfolio: {response.get('name')}")
        else:
            self.log_result("Update Portfolio", False, f"Failed: {response}")
        
        return success

    def test_publish_portfolio(self):
        """Test publishing a portfolio"""
        if not self.test_portfolio_id:
            self.log_result("Publish Portfolio", False, "Skipped - No portfolio ID available")
            return False
        
        success, response = self.make_request('POST', f'portfolios/{self.test_portfolio_id}/publish', {})
        
        if success:
            slug = response.get('slug')
            self.log_result("Publish Portfolio", True, f"Published with slug: {slug}")
            self.test_slug = slug
        else:
            self.log_result("Publish Portfolio", False, f"Failed: {response}")
        
        return success

    def test_public_portfolio_access(self):
        """Test accessing published portfolio publicly"""
        if not hasattr(self, 'test_slug'):
            self.log_result("Public Portfolio Access", False, "Skipped - No slug available")
            return False
        
        success, response = self.make_request('GET', f'public/portfolio/{self.test_slug}')
        
        if success:
            self.log_result("Public Portfolio Access", True, f"Public portfolio accessible")
        else:
            self.log_result("Public Portfolio Access", False, f"Failed: {response}")
        
        return success

    def test_github_integration(self):
        """Test GitHub repos import"""
        # Test with a known public GitHub username
        test_username = "octocat"
        
        success, response = self.make_request('GET', f'github/repos/{test_username}')
        
        if success:
            projects = response.get('projects', [])
            self.log_result("GitHub Integration", True, f"Retrieved {len(projects)} repos")
        else:
            self.log_result("GitHub Integration", False, f"Failed: {response}")
        
        return success

    def test_ai_content_generation(self):
        """Test AI content generation (Pro feature)"""
        test_data = {
            "context": "Full-stack developer with expertise in Python and JavaScript",
            "type": "about"
        }
        
        success, response = self.make_request('POST', 'ai/generate', test_data, expect_status=403)
        
        # We expect this to fail with 403 since test user is on free plan
        if not success and "Pro subscription" in str(response):
            self.log_result("AI Content Generation", True, "Correctly blocked for free users")
        else:
            self.log_result("AI Content Generation", False, f"Unexpected response: {response}")
        
        return True  # This test should fail for free users

    def test_subscription_status(self):
        """Test getting subscription status"""
        success, response = self.make_request('GET', 'subscription/status')
        
        if success:
            plan = response.get('plan')
            self.log_result("Subscription Status", True, f"Plan: {plan}")
        else:
            self.log_result("Subscription Status", False, f"Failed: {response}")
        
        return success

    def test_logout(self):
        """Test user logout"""
        success, response = self.make_request('POST', 'auth/logout', {})
        
        if success:
            self.log_result("User Logout", True, "Logout successful")
        else:
            self.log_result("User Logout", False, f"Failed: {response}")
        
        return success

    def test_delete_portfolio(self):
        """Test deleting a portfolio"""
        if not self.test_portfolio_id:
            self.log_result("Delete Portfolio", False, "Skipped - No portfolio ID available")
            return False
        
        success, response = self.make_request('DELETE', f'portfolios/{self.test_portfolio_id}')
        
        if success:
            self.log_result("Delete Portfolio", True, "Portfolio deleted successfully")
        else:
            self.log_result("Delete Portfolio", False, f"Failed: {response}")
        
        return success

    def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 Starting AI Portfolio Builder API Tests")
        print(f"📍 Testing endpoint: {self.base_url}")
        print("=" * 60)
        
        # Authentication & User Management
        self.test_signup()
        if self.session_token:  # Only proceed if signup successful
            self.test_get_user_profile()
            
            # Portfolio Management
            self.test_create_portfolio()
            self.test_get_portfolios()
            self.test_get_single_portfolio()
            self.test_update_portfolio()
            self.test_publish_portfolio()
            self.test_public_portfolio_access()
            
            # Integrations
            self.test_github_integration()
            self.test_ai_content_generation()
            self.test_subscription_status()
            
            # Cleanup
            self.test_delete_portfolio()
            self.test_logout()
        
        # Print results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n🎯 Overall: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed!")
            return 1

def main():
    """Main entry point"""
    tester = AIPortfolioAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())