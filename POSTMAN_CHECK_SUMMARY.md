# Postman Check Summary

Use this file to validate the backend quickly in Postman before submission/demo.

## Postman Environment Variables

Create a Postman environment with:
- `baseUrl` = `http://localhost:5001/api`
- `token` = (leave empty initially)
- `leadId` = (leave empty initially)

## Auth Request (Run First)

**Request**
- Method: `POST`
- URL: `{{baseUrl}}/auth/login`
- Body (raw JSON):

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Expected**
- Status: `200 OK`
- Response includes `token` and `user`
- Save token to environment variable `token`

## Auth Header for Protected APIs

For all requests below, add:
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json` (when body is present)

## Endpoint-by-Endpoint Verification

1. **Create Lead**
   - `POST {{baseUrl}}/leads`
   - Body:
   ```json
   {
     "leadName": "Jane Prospect",
     "companyName": "NovaTech",
     "email": "jane@novatech.com",
     "phoneNumber": "+94771234567",
     "leadSource": "LinkedIn",
     "assignedSalesperson": "Nadeesha",
     "status": "New",
     "estimatedDealValue": 12000
   }
   ```
   - Expected: `201 Created`
   - Save response `_id` as `leadId`

2. **Get Leads**
   - `GET {{baseUrl}}/leads`
   - Expected: `200 OK` and array contains created lead

3. **Filter / Search**
   - `GET {{baseUrl}}/leads?status=New&leadSource=LinkedIn&search=jane`
   - Expected: `200 OK` and filtered result(s)

4. **Get Lead Detail**
   - `GET {{baseUrl}}/leads/{{leadId}}`
   - Expected: `200 OK`, includes lead data + `notes` array

5. **Update Lead**
   - `PUT {{baseUrl}}/leads/{{leadId}}`
   - Body: same as create, but change values (example `status: "Qualified"`)
   - Expected: `200 OK` with updated fields

6. **Update Lead Status**
   - `PATCH {{baseUrl}}/leads/{{leadId}}/status`
   - Body:
   ```json
   {
     "status": "Won"
   }
   ```
   - Expected: `200 OK` and `status` becomes `Won`

7. **Add Note**
   - `POST {{baseUrl}}/leads/{{leadId}}/notes`
   - Body:
   ```json
   {
     "content": "Client approved proposal and requested onboarding."
   }
   ```
   - Expected: `201 Created`, includes `createdBy`, `createdAt`

8. **Dashboard**
   - `GET {{baseUrl}}/dashboard`
   - Expected: `200 OK` with:
     - `totalLeads`
     - `newLeads`
     - `qualifiedLeads`
     - `wonLeads`
     - `lostLeads`
     - `totalEstimatedDealValue`
     - `totalWonDealValue`

9. **Delete Lead**
   - `DELETE {{baseUrl}}/leads/{{leadId}}`
   - Expected: `204 No Content`

10. **Unauthorized Check**
   - Remove/clear `Authorization` header and call `GET {{baseUrl}}/leads`
   - Expected: `401 Unauthorized`

## Postman Pass/Fail Checklist

- [ ] Login returns JWT successfully
- [ ] Protected routes reject missing token
- [ ] Lead create/read/update/delete all work
- [ ] Status update endpoint works
- [ ] Notes endpoint works
- [ ] Dashboard values return correctly
- [ ] Search and filtering return expected results
- [ ] No 5xx errors during happy-path testing
