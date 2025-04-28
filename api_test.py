import requests
from pathlib import Path

class NoteApiTester:
    def __init__(self, base_url="http://localhost:3000/api/notes"):
        self.base_url = base_url
        self.test_note_id = None

    def test_create_note(self):
        print("\n=== Testing CREATE note ===")
        # Test without file
        data = {
            "title": "Test Note",
            "content": "This is a test note content"
        }
        response = requests.post(self.base_url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Save note id for other tests
        if response.status_code == 201:
            self.test_note_id = response.json()['data']['id']

        # Test with file
        test_file_path = Path("test_image.jpg")
        if test_file_path.exists():
            files = {
                'file': ('test_image.jpg', open(test_file_path, 'rb'), 'image/jpeg')
            }
            data = {
                "title": "Test Note with File",
                "content": "This is a test note with file attachment"
            }
            response = requests.post(self.base_url, data=data, files=files)
            print("\nCreate with file:")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")

    def test_get_all_notes(self):
        print("\n=== Testing GET all notes ===")
        response = requests.get(self.base_url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

    def test_get_note_by_id(self):
        if not self.test_note_id:
            print("\n=== Skipping GET note by ID (no test note) ===")
            return

        print(f"\n=== Testing GET note by ID ({self.test_note_id}) ===")
        response = requests.get(f"{self.base_url}/{self.test_note_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

    def test_update_note(self):
        if not self.test_note_id:
            print("\n=== Skipping UPDATE note (no test note) ===")
            return

        print(f"\n=== Testing UPDATE note ({self.test_note_id}) ===")
        data = {
            "title": "Updated Test Note",
            "content": "This is an updated test note content"
        }
        response = requests.put(f"{self.base_url}/{self.test_note_id}", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

    def test_delete_note(self):
        if not self.test_note_id:
            print("\n=== Skipping DELETE note (no test note) ===")
            return

        print(f"\n=== Testing DELETE note ({self.test_note_id}) ===")
        response = requests.delete(f"{self.base_url}/{self.test_note_id}")
        print(f"Status: {response.status_code}, from {self.base_url}/{self.test_note_id}")
        if response.text:
            print(f"Response: {response.text}")

    def run_all_tests(self):
        print("Starting API tests...")
        self.test_get_all_notes()
        self.test_create_note()
        self.test_get_note_by_id()
        self.test_update_note()
        self.test_delete_note()
        print("\nAPI tests completed!")

if __name__ == "__main__":
    # Create tester instance
    tester = NoteApiTester()
    
    # Run all tests
    tester.run_all_tests()