
# Railway deployment - Auto-triggered
from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage
import io
from PIL import Image
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get LLM key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# ============ MODELS ============

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    category: str
    description: str
    merchant: Optional[str] = None
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    currency: str = "INR"
    is_regret: bool = False
    user_id: str = "default_user"

class Income(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    source: str
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    currency: str = "INR"
    user_id: str = "default_user"

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    billing_cycle: str  # monthly, yearly
    next_billing_date: str
    currency: str = "INR"
    category: str
    user_id: str = "default_user"
    is_active: bool = True

class PriceTracker(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_name: str
    current_price: float
    target_price: Optional[float] = None
    url: Optional[str] = None
    currency: str = "INR"
    user_id: str = "default_user"
    price_history: List[Dict[str, Any]] = []

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: str
    currency: str = "INR"
    user_id: str = "default_user"

class CategoryBudget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    monthly_limit: float
    current_spent: float = 0.0
    currency: str = "INR"
    user_id: str = "default_user"
    month: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m"))

class RecurringTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    category: str
    transaction_type: str  # expense or income
    recurring_date: int  # day of month (1-31)
    currency: str = "INR"
    user_id: str = "default_user"
    is_active: bool = True
    last_processed: Optional[str] = None

class UserPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = "default_user"
    personality_mode: str = "Balanced"  # Saver, Spender, Minimalist, Adventurous, Foodie
    language: str = "en"  # en, hi, te, ta, kn
    spending_alerts: bool = True
    email: Optional[str] = None

class Debt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    principal_amount: float
    interest_rate: float  # Annual percentage
    tenure_months: int
    start_date: str
    emi_amount: float = 0.0
    total_interest: float = 0.0
    total_payable: float = 0.0
    currency: str = "INR"
    user_id: str = "default_user"
    status: str = "active"  # active, paid

class Badge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    earned_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    user_id: str = "default_user"

class VoiceExpenseRequest(BaseModel):
    voice_text: str

class ReceiptAnalysisRequest(BaseModel):
    image_base64: str

class AITwinRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

# ============ HELPER FUNCTIONS ============

async def get_ai_response(prompt: str, system_message: str = "You are a helpful financial assistant.") -> str:
    """Get AI response using emergent integrations"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logging.error(f"AI Error: {str(e)}")
        return "AI service temporarily unavailable. Please try again."

# ============ EXPENSE ROUTES ============

@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense: Expense):
    doc = expense.model_dump()
    await db.expenses.insert_one(doc)
    return expense

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(user_id: str = "default_user"):
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return expenses

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, expense: Expense):
    doc = expense.model_dump()
    result = await db.expenses.replace_one({"id": expense_id}, doc)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

# ============ INCOME ROUTES ============

@api_router.post("/income", response_model=Income)
async def create_income(income: Income):
    doc = income.model_dump()
    await db.income.insert_one(doc)
    return income

@api_router.get("/income", response_model=List[Income])
async def get_income(user_id: str = "default_user"):
    income = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return income

# ============ SUBSCRIPTION ROUTES ============

@api_router.post("/subscriptions", response_model=Subscription)
async def create_subscription(subscription: Subscription):
    doc = subscription.model_dump()
    await db.subscriptions.insert_one(doc)
    return subscription

@api_router.get("/subscriptions", response_model=List[Subscription])
async def get_subscriptions(user_id: str = "default_user"):
    subscriptions = await db.subscriptions.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return subscriptions

@api_router.delete("/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str):
    result = await db.subscriptions.delete_one({"id": subscription_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription deleted successfully"}

@api_router.get("/subscriptions/total")
async def get_total_subscription_cost(user_id: str = "default_user"):
    subscriptions = await db.subscriptions.find({"user_id": user_id, "is_active": True}, {"_id": 0}).to_list(1000)
    monthly_total = sum(
        sub["amount"] if sub["billing_cycle"] == "monthly" else sub["amount"] / 12
        for sub in subscriptions
    )
    return {"monthly_total": monthly_total, "yearly_total": monthly_total * 12}

# ============ PRICE TRACKER ROUTES ============

@api_router.post("/price-tracker", response_model=PriceTracker)
async def create_price_tracker(tracker: PriceTracker):
    tracker.price_history = [{"price": tracker.current_price, "date": datetime.now(timezone.utc).isoformat()}]
    doc = tracker.model_dump()
    await db.price_trackers.insert_one(doc)
    return tracker

@api_router.get("/price-tracker", response_model=List[PriceTracker])
async def get_price_trackers(user_id: str = "default_user"):
    trackers = await db.price_trackers.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return trackers

@api_router.put("/price-tracker/{tracker_id}/update-price")
async def update_price(tracker_id: str, new_price: float = Body(..., embed=True)):
    tracker = await db.price_trackers.find_one({"id": tracker_id}, {"_id": 0})
    if not tracker:
        raise HTTPException(status_code=404, detail="Tracker not found")
    
    price_entry = {"price": new_price, "date": datetime.now(timezone.utc).isoformat()}
    tracker["price_history"].append(price_entry)
    tracker["current_price"] = new_price
    
    await db.price_trackers.replace_one({"id": tracker_id}, tracker)
    return {"message": "Price updated", "tracker": tracker}

# ============ GOAL ROUTES ============

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal: Goal):
    doc = goal.model_dump()
    await db.goals.insert_one(doc)
    return goal

@api_router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = "default_user"):
    goals = await db.goals.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return goals

@api_router.put("/goals/{goal_id}")
async def update_goal(goal_id: str, current_amount: float = Body(..., embed=True)):
    result = await db.goals.update_one(
        {"id": goal_id},
        {"$set": {"current_amount": current_amount}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal updated"}

@api_router.get("/goals/{goal_id}/calculations")
async def get_goal_calculations(goal_id: str):
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    target_date = datetime.fromisoformat(goal["target_date"])
    today = datetime.now(timezone.utc)
    days_remaining = (target_date - today).days
    
    if days_remaining <= 0:
        return {"message": "Target date has passed", "days_remaining": 0}
    
    remaining_amount = goal["target_amount"] - goal["current_amount"]
    daily_savings = remaining_amount / days_remaining if days_remaining > 0 else 0
    monthly_savings = daily_savings * 30
    
    return {
        "days_remaining": days_remaining,
        "remaining_amount": remaining_amount,
        "daily_savings_needed": daily_savings,
        "monthly_savings_needed": monthly_savings
    }

# ============ ANALYTICS ROUTES ============

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(user_id: str = "default_user"):
    # Get all data
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    income = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    subscriptions = await db.subscriptions.find({"user_id": user_id, "is_active": True}, {"_id": 0}).to_list(1000)
    
    total_expenses = sum(e["amount"] for e in expenses)
    total_income = sum(i["amount"] for i in income)
    total_savings = total_income - total_expenses
    
    # Category-wise breakdown
    category_breakdown = {}
    for expense in expenses:
        cat = expense["category"]
        category_breakdown[cat] = category_breakdown.get(cat, 0) + expense["amount"]
    
    # Monthly subscription cost
    monthly_subs = sum(
        sub["amount"] if sub["billing_cycle"] == "monthly" else sub["amount"] / 12
        for sub in subscriptions
    )
    
    # Regret purchases
    regret_expenses = [e for e in expenses if e.get("is_regret", False)]
    total_regret = sum(e["amount"] for e in regret_expenses)
    
    return {
        "total_expenses": total_expenses,
        "total_income": total_income,
        "total_savings": total_savings,
        "savings_percentage": (total_savings / total_income * 100) if total_income > 0 else 0,
        "category_breakdown": category_breakdown,
        "monthly_subscription_cost": monthly_subs,
        "total_regret_amount": total_regret,
        "regret_count": len(regret_expenses)
    }

@api_router.get("/analytics/trends")
async def get_spending_trends(user_id: str = "default_user", days: int = 30):
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Group by date
    daily_spending = {}
    for expense in expenses:
        date_str = expense["date"][:10]  # Get YYYY-MM-DD
        daily_spending[date_str] = daily_spending.get(date_str, 0) + expense["amount"]
    
    # Sort by date
    sorted_data = sorted(daily_spending.items(), key=lambda x: x[0])
    
    return {
        "daily_spending": [{
            "date": date,
            "amount": amount
        } for date, amount in sorted_data[-days:]]
    }

# ============ VOICE EXPENSE TRACKING ============

@api_router.post("/expenses/voice")
async def create_expense_from_voice(request: VoiceExpenseRequest):
    """Parse voice text and create expense"""
    prompt = f'''Extract expense information from this voice input: "{request.voice_text}"
    
    Return ONLY a valid JSON object with these fields:
    {{
        "amount": <number>,
        "category": "<category like Food, Transport, Shopping, etc>",
        "description": "<short description>",
        "merchant": "<merchant name if mentioned, otherwise null>"
    }}
    
    Example input: "Add chai 12 rupees"
    Example output: {{"amount": 12, "category": "Food", "description": "Chai", "merchant": null}}
    '''
    
    ai_response = await get_ai_response(prompt, "You are a JSON extraction assistant. Always return valid JSON only.")
    
    try:
        # Clean the response
        ai_response = ai_response.strip()
        if ai_response.startswith("```json"):
            ai_response = ai_response[7:]
        if ai_response.startswith("```"):
            ai_response = ai_response[3:]
        if ai_response.endswith("```"):
            ai_response = ai_response[:-3]
        ai_response = ai_response.strip()
        
        expense_data = json.loads(ai_response)
        
        expense = Expense(
            amount=expense_data["amount"],
            category=expense_data["category"],
            description=expense_data["description"],
            merchant=expense_data.get("merchant")
        )
        
        doc = expense.model_dump()
        await db.expenses.insert_one(doc)
        
        return {"success": True, "expense": expense}
    except Exception as e:
        logging.error(f"Voice parsing error: {str(e)}")
        raise HTTPException(status_code=400, detail="Could not parse voice input")

# ============ RECEIPT SCANNING ============

@api_router.post("/expenses/scan-receipt")
async def scan_receipt(request: ReceiptAnalysisRequest):
    """Analyze receipt using AI vision"""
    try:
        prompt = '''Analyze this receipt image and extract:
        1. Items purchased (name and price)
        2. Total amount
        3. Merchant/Store name
        4. Category (Food, Shopping, Healthcare, etc.)
        5. Date (if visible)
        
        Return as JSON:
        {
            "merchant": "store name",
            "total": <total amount>,
            "category": "category",
            "date": "date or null",
            "items": [{"name": "item", "price": price}]
        }
        '''
        
        from emergentintegrations.llm.chat import ImageContent
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a receipt analysis assistant. Return valid JSON only."
        ).with_model("openai", "gpt-4o-mini")
        
        image_content = ImageContent(image_base64=request.image_base64)
        user_message = UserMessage(
            text=prompt,
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Clean response
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        receipt_data = json.loads(response)
        
        # Create expense from receipt
        expense = Expense(
            amount=receipt_data["total"],
            category=receipt_data["category"],
            description=f"Receipt from {receipt_data['merchant']}",
            merchant=receipt_data["merchant"]
        )
        
        doc = expense.model_dump()
        await db.expenses.insert_one(doc)
        
        return {"success": True, "receipt_data": receipt_data, "expense": expense}
    except Exception as e:
        logging.error(f"Receipt scan error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Receipt analysis failed: {str(e)}")

# ============ AI TWIN ============

@api_router.post("/ai-twin/chat")
async def ai_twin_chat(request: AITwinRequest):
    """AI financial advisor with multi-language support"""
    # Get user's financial data and preferences
    user_id = request.context.get("user_id", "default_user") if request.context else "default_user"
    
    # Get user preferences for language
    prefs = await db.preferences.find_one({"user_id": user_id}, {"_id": 0})
    language = prefs.get("language", "en") if prefs else "en"
    
    # Language mapping
    lang_names = {
        "en": "English",
        "hi": "Hindi",
        "te": "Telugu",
        "ta": "Tamil",
        "kn": "Kannada"
    }
    
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    income = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    subscriptions = await db.subscriptions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    goals = await db.goals.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    total_expenses = sum(e["amount"] for e in expenses)
    total_income = sum(i["amount"] for i in income)
    
    language_instruction = f"IMPORTANT: Respond ONLY in {lang_names.get(language, 'English')} language." if language != "en" else ""
    
    context_prompt = f'''{language_instruction}
    
    You are a personal financial AI advisor. Here's the user's financial data:
    
    Total Income: ₹{total_income}
    Total Expenses: ₹{total_expenses}
    Savings: ₹{total_income - total_expenses}
    Active Subscriptions: {len([s for s in subscriptions if s.get('is_active', True)])}
    Active Goals: {len(goals)}
    
    User Question: {request.message}
    
    Provide helpful, personalized financial advice based on this data.
    '''
    
    response = await get_ai_response(context_prompt, "You are a friendly, knowledgeable financial advisor.")
    
    return {"response": response}

# ============ BILL NEGOTIATOR ============

@api_router.post("/bill-negotiator/generate-script")
async def generate_negotiation_script(bill_type: str = Body(...), current_amount: float = Body(...)):
    prompt = f'''Generate a negotiation script for a {bill_type} bill that costs ₹{current_amount} per month.
    
    Include:
    1. Opening statement
    2. Key talking points
    3. Alternative cheaper plans to ask about
    4. Expected savings estimate
    5. Closing statement
    
    Make it polite but firm.
    '''
    
    script = await get_ai_response(prompt)
    
    return {"script": script, "bill_type": bill_type}

# ============ CATEGORY BUDGETS ============

@api_router.post("/budgets", response_model=CategoryBudget)
async def create_budget(budget: CategoryBudget):
    doc = budget.model_dump()
    await db.budgets.insert_one(doc)
    return budget

@api_router.get("/budgets", response_model=List[CategoryBudget])
async def get_budgets(user_id: str = "default_user"):
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    budgets = await db.budgets.find({"user_id": user_id, "month": current_month}, {"_id": 0}).to_list(1000)
    
    # Calculate current spent for each budget
    for budget in budgets:
        expenses = await db.expenses.find({
            "user_id": user_id,
            "category": budget["category"],
            "date": {"$regex": f"^{current_month}"}
        }, {"_id": 0}).to_list(1000)
        budget["current_spent"] = sum(e["amount"] for e in expenses)
    
    return budgets

@api_router.get("/budgets/status/{category}")
async def get_budget_status(category: str, user_id: str = "default_user"):
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    budget = await db.budgets.find_one({"user_id": user_id, "category": category, "month": current_month}, {"_id": 0})
    
    if not budget:
        return {"status": "no_limit", "message": "No budget set for this category"}
    
    expenses = await db.expenses.find({
        "user_id": user_id,
        "category": category,
        "date": {"$regex": f"^{current_month}"}
    }, {"_id": 0}).to_list(1000)
    
    current_spent = sum(e["amount"] for e in expenses)
    percentage = (current_spent / budget["monthly_limit"]) * 100
    
    if percentage >= 100:
        status = "exceeded"
        message = f"Budget exceeded! You've spent {percentage:.1f}% of your limit."
    elif percentage >= 80:
        status = "warning"
        message = f"Warning! You've used {percentage:.1f}% of your budget."
    else:
        status = "safe"
        message = f"You've used {percentage:.1f}% of your budget."
    
    return {
        "status": status,
        "percentage": percentage,
        "current_spent": current_spent,
        "limit": budget["monthly_limit"],
        "remaining": budget["monthly_limit"] - current_spent,
        "message": message
    }

# ============ RECURRING TRANSACTIONS ============

@api_router.post("/recurring-transactions", response_model=RecurringTransaction)
async def create_recurring_transaction(transaction: RecurringTransaction):
    doc = transaction.model_dump()
    await db.recurring_transactions.insert_one(doc)
    return transaction

@api_router.get("/recurring-transactions", response_model=List[RecurringTransaction])
async def get_recurring_transactions(user_id: str = "default_user"):
    transactions = await db.recurring_transactions.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return transactions

@api_router.post("/recurring-transactions/process")
async def process_recurring_transactions(user_id: str = "default_user"):
    """Process due recurring transactions"""
    current_date = datetime.now(timezone.utc)
    current_day = current_date.day
    current_month = current_date.strftime("%Y-%m")
    
    recurring = await db.recurring_transactions.find({
        "user_id": user_id,
        "is_active": True
    }, {"_id": 0}).to_list(1000)
    
    processed = []
    
    for trans in recurring:
        # Check if it's due and not processed this month
        if trans["recurring_date"] == current_day:
            last_processed = trans.get("last_processed")
            if not last_processed or not last_processed.startswith(current_month):
                # Create the transaction
                if trans["transaction_type"] == "expense":
                    expense = Expense(
                        amount=trans["amount"],
                        category=trans["category"],
                        description=f"{trans['name']} (Auto-added)",
                        currency=trans["currency"],
                        user_id=user_id
                    )
                    await db.expenses.insert_one(expense.model_dump())
                else:
                    income = Income(
                        amount=trans["amount"],
                        source=trans["name"],
                        currency=trans["currency"],
                        user_id=user_id
                    )
                    await db.income.insert_one(income.model_dump())
                
                # Update last processed
                await db.recurring_transactions.update_one(
                    {"id": trans["id"]},
                    {"$set": {"last_processed": current_date.isoformat()}}
                )
                processed.append(trans["name"])
    
    return {"processed": processed, "count": len(processed)}

# ============ EXPENSE SEARCH & FILTERS ============

@api_router.get("/expenses/search")
async def search_expenses(
    query: Optional[str] = None,
    category: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: str = "default_user"
):
    filter_query = {"user_id": user_id}
    
    if query:
        filter_query["$or"] = [
            {"description": {"$regex": query, "$options": "i"}},
            {"merchant": {"$regex": query, "$options": "i"}}
        ]
    
    if category:
        filter_query["category"] = category
    
    if min_amount is not None or max_amount is not None:
        filter_query["amount"] = {}
        if min_amount is not None:
            filter_query["amount"]["$gte"] = min_amount
        if max_amount is not None:
            filter_query["amount"]["$lte"] = max_amount
    
    if start_date or end_date:
        filter_query["date"] = {}
        if start_date:
            filter_query["date"]["$gte"] = start_date
        if end_date:
            filter_query["date"]["$lte"] = end_date
    
    expenses = await db.expenses.find(filter_query, {"_id": 0}).to_list(1000)
    return {"results": expenses, "count": len(expenses)}

# ============ DUPLICATE DETECTION ============

@api_router.get("/expenses/duplicates")
async def detect_duplicates(user_id: str = "default_user"):
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    duplicates = []
    checked = set()
    
    for i, exp1 in enumerate(expenses):
        if exp1["id"] in checked:
            continue
        
        potential_dupes = []
        for j, exp2 in enumerate(expenses):
            if i != j and exp2["id"] not in checked:
                # Check if similar
                if (exp1["amount"] == exp2["amount"] and
                    exp1["category"] == exp2["category"] and
                    exp1["date"][:10] == exp2["date"][:10]):
                    potential_dupes.append(exp2)
        
        if potential_dupes:
            duplicates.append({
                "original": exp1,
                "duplicates": potential_dupes
            })
            checked.add(exp1["id"])
            for d in potential_dupes:
                checked.add(d["id"])
    
    return {"duplicates": duplicates, "count": len(duplicates)}

# ============ BEHAVIOUR ANALYTICS ============

@api_router.get("/analytics/behaviour")
async def get_behaviour_analytics(user_id: str = "default_user"):
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    if not expenses:
        return {"patterns": [], "alerts": []}
    
    # Analyze patterns
    weekday_spending = {}
    late_night_orders = 0
    weekend_overspending = 0
    
    for expense in expenses:
        date = datetime.fromisoformat(expense["date"].replace("Z", "+00:00"))
        weekday = date.strftime("%A")
        hour = date.hour
        
        weekday_spending[weekday] = weekday_spending.get(weekday, 0) + expense["amount"]
        
        if hour >= 22 or hour <= 4:  # Late night
            late_night_orders += 1
        
        if weekday in ["Saturday", "Sunday"]:
            weekend_overspending += expense["amount"]
    
    # Generate alerts
    alerts = []
    avg_spending = sum(weekday_spending.values()) / len(weekday_spending) if weekday_spending else 0
    
    for day, amount in weekday_spending.items():
        if amount > avg_spending * 1.5:
            alerts.append({
                "type": "high_spending_day",
                "day": day,
                "message": f"You tend to overspend on {day}s. Be mindful today!"
            })
    
    if late_night_orders > 5:
        alerts.append({
            "type": "late_night_ordering",
            "count": late_night_orders,
            "message": f"You've made {late_night_orders} late-night purchases. Consider setting a reminder!"
        })
    
    return {
        "patterns": {
            "weekday_spending": weekday_spending,
            "late_night_orders": late_night_orders,
            "weekend_spending": weekend_overspending
        },
        "alerts": alerts
    }

# ============ USER PREFERENCES ============

@api_router.post("/preferences")
async def save_preferences(preferences: UserPreferences):
    await db.preferences.replace_one(
        {"user_id": preferences.user_id},
        preferences.model_dump(),
        upsert=True
    )
    return preferences

@api_router.get("/preferences")
async def get_preferences(user_id: str = "default_user"):
    prefs = await db.preferences.find_one({"user_id": user_id}, {"_id": 0})
    if not prefs:
        # Return defaults
        return UserPreferences().model_dump()
    return prefs

# ============ AI AUTO-CATEGORIZATION ============

@api_router.post("/expenses/auto-categorize")
async def auto_categorize_expense(description: str = Body(...), amount: float = Body(...)):
    prompt = f'''Categorize this expense:
    Description: "{description}"
    Amount: {amount}
    
    Return ONLY a JSON with:
    {{
        "category": "<one of: Food, Transport, Shopping, Entertainment, Healthcare, Bills, Other>",
        "merchant": "<guess merchant name or null>",
        "notes": "<brief note about the expense>"
    }}
    '''
    
    ai_response = await get_ai_response(prompt, "You are an expense categorization assistant. Return only valid JSON.")
    
    try:
        # Clean response
        ai_response = ai_response.strip()
        if ai_response.startswith("```json"):
            ai_response = ai_response[7:]
        if ai_response.startswith("```"):
            ai_response = ai_response[3:]
        if ai_response.endswith("```"):
            ai_response = ai_response[:-3]
        ai_response = ai_response.strip()
        
        result = json.loads(ai_response)
        return result
    except:
        return {"category": "Other", "merchant": None, "notes": ""}

# ============ LEADERBOARD ============

@api_router.get("/leaderboard")
async def get_leaderboard():
    # Mock data for demo - in real app, aggregate from all users
    users_data = [
        {"user_id": "default_user", "savings_percentage": 0}
    ]
    
    # Calculate savings for default user
        try:
    expenses = await db.expenses.find({"user_id": "default_user"}, {"_id": 0}).to_list(1000)
    income = await db.income.find({"user_id": "default_user"}, {"_id": 0}).to_list(1000)
    
    total_expenses = sum(e["amount"] for e in expenses)
    total_income = sum(i["amount"] for i in income)
    savings_pct = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
    
    users_data[0]["savings_percentage"] = savings_pct
    
    # Add mock competitors
    import random
    for i in range(1, 10):
        users_data.append({
            "user_id": f"user_{i}",
            "savings_percentage": random.uniform(10, 50)
        })
    
    # Sort by savings
    leaderboard = sorted(users_data, key=lambda x: x["savings_percentage"], reverse=True)
    
    # Add ranks
    for idx, user in enumerate(leaderboard, 1):
        user["rank"] = idx
    
    return {"leaderboard": leaderboard[:10]}

# ============ DEBT MANAGEMENT ============

@api_router.post("/debts", response_model=Debt)
async def create_debt(debt: Debt):
    # Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
    P = debt.principal_amount
    r = debt.interest_rate / (12 * 100)  # Monthly interest rate
    n = debt.tenure_months
    
    if r > 0:
        emi = P * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
    else:
        emi = P / n
    
    debt.emi_amount = round(emi, 2)
    debt.total_payable = round(emi * n, 2)
    debt.total_interest = round(debt.total_payable - P, 2)
    
    doc = debt.model_dump()
    await db.debts.insert_one(doc)
    return debt

@api_router.get("/debts", response_model=List[Debt])
async def get_debts(user_id: str = "default_user"):
    debts = await db.debts.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return debts

@api_router.put("/debts/{debt_id}")
async def update_debt_status(debt_id: str, status: str = Body(..., embed=True)):
    result = await db.debts.update_one({"id": debt_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Debt not found")
    return {"message": "Debt status updated"}

@api_router.delete("/debts/{debt_id}")
async def delete_debt(debt_id: str):
    result = await db.debts.delete_one({"id": debt_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Debt not found")
    return {"message": "Debt deleted"}

# ============ MERCHANT INSIGHTS ============

@api_router.get("/analytics/merchants")
async def get_merchant_insights(user_id: str = "default_user"):
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Common merchants to detect
    merchant_keywords = {
        "Zomato": ["zomato"],
        "Swiggy": ["swiggy"],
        "Amazon": ["amazon", "amzn"],
        "Flipkart": ["flipkart"],
        "Uber": ["uber"],
        "Ola": ["ola"],
        "Netflix": ["netflix"],
        "Prime Video": ["prime", "amazon video"],
        "Spotify": ["spotify"],
        "Starbucks": ["starbucks"],
        "McDonald's": ["mcdonalds", "mcd", "mcdonald"],
        "BigBasket": ["bigbasket"],
        "Blinkit": ["blinkit", "grofers"]
    }
    
    merchant_data = {}
    
    for expense in expenses:
        merchant = expense.get("merchant", "").lower()
        description = expense.get("description", "").lower()
        text = f"{merchant} {description}"
        
        matched_merchant = "Others"
        for merchant_name, keywords in merchant_keywords.items():
            if any(kw in text for kw in keywords):
                matched_merchant = merchant_name
                break
        
        if matched_merchant not in merchant_data:
            merchant_data[matched_merchant] = {
                "merchant": matched_merchant,
                "total_spent": 0,
                "transaction_count": 0,
                "transactions": []
            }
        
        merchant_data[matched_merchant]["total_spent"] += expense["amount"]
        merchant_data[matched_merchant]["transaction_count"] += 1
        merchant_data[matched_merchant]["transactions"].append({
            "amount": expense["amount"],
            "date": expense["date"],
            "description": expense["description"]
        })
    
    # Calculate averages
    for merchant in merchant_data.values():
        merchant["average_transaction"] = merchant["total_spent"] / merchant["transaction_count"]
        merchant["transactions"] = merchant["transactions"][-10:]  # Last 10 transactions
    
    # Sort by total spent
    sorted_merchants = sorted(merchant_data.values(), key=lambda x: x["total_spent"], reverse=True)
    
    return {"merchants": sorted_merchants}

# ============ BADGES & MILESTONES ============

@api_router.get("/badges")
async def get_badges(user_id: str = "default_user"):
    badges = await db.badges.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return {"badges": badges}

@api_router.post("/badges/check")
async def check_and_award_badges(user_id: str = "default_user"):
    """Check if user qualifies for new badges"""
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    income = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    existing_badges = await db.badges.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    existing_badge_names = {b["name"] for b in existing_badges}
    new_badges = []
    
    total_expenses = sum(e["amount"] for e in expenses)
    total_income = sum(i["amount"] for i in income)
    savings = total_income - total_expenses
    
    # Badge criteria
    badges_to_check = []
    
    # First expense tracked
    if len(expenses) >= 1 and "First Step" not in existing_badge_names:
        badges_to_check.append({
            "name": "First Step",
            "description": "Added your first expense!",
            "icon": "🎯"
        })
    
    # 10k saved
    if savings >= 10000 and "₹10K Saver" not in existing_badge_names:
        badges_to_check.append({
            "name": "₹10K Saver",
            "description": "Saved ₹10,000!",
            "icon": "💰"
        })
    
    # 5 days no regret purchases
    recent_expenses = [e for e in expenses if not e.get("is_regret", False)][-5:]
    if len(recent_expenses) >= 5 and "Smart Spender" not in existing_badge_names:
        badges_to_check.append({
            "name": "Smart Spender",
            "description": "5 days without regret purchases!",
            "icon": "🧠"
        })
    
    # Tracked 30+ expenses
    if len(expenses) >= 30 and "Consistency King" not in existing_badge_names:
        badges_to_check.append({
            "name": "Consistency King",
            "description": "Tracked 30+ expenses!",
            "icon": "👑"
        })
    
    # Savings rate > 30%
    if total_income > 0:
        savings_rate = (savings / total_income) * 100
        if savings_rate >= 30 and "Super Saver" not in existing_badge_names:
            badges_to_check.append({
                "name": "Super Saver",
                "description": "Achieved 30%+ savings rate!",
                "icon": "⭐"
            })
    
    # Award new badges
    for badge_info in badges_to_check:
        badge = Badge(**badge_info, user_id=user_id)
        await db.badges.insert_one(badge.model_dump())
        new_badges.append(badge)
    
    return {"new_badges": new_badges, "total_badges": len(existing_badges) + len(new_badges)}

# ============ LIFESTYLE RECOMMENDATIONS ============

@api_router.get("/recommendations")
async def get_lifestyle_recommendations(user_id: str = "default_user"):
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    subscriptions = await db.subscriptions.find({"user_id": user_id, "is_active": True}, {"_id": 0}).to_list(1000)
    
    recommendations = []
    
    # Analyze food delivery spending
    food_delivery_expenses = [e for e in expenses if any(
        kw in e.get("merchant", "").lower() + e.get("description", "").lower()
        for kw in ["zomato", "swiggy", "food", "delivery"]
    )]
    
    if len(food_delivery_expenses) > 4:
        monthly_food_delivery = sum(e["amount"] for e in food_delivery_expenses)
        savings_potential = monthly_food_delivery * 0.5  # Assume 50% reduction
        
        recommendations.append({
            "title": "Reduce Food Delivery",
            "description": f"You've ordered food {len(food_delivery_expenses)} times. Cooking at home just once a week could save you!",
            "potential_savings": round(savings_potential, 2),
            "category": "Food",
            "priority": "high"
        })
    
    # Analyze subscriptions
    monthly_subs_cost = sum(
        sub["amount"] if sub["billing_cycle"] == "monthly" else sub["amount"] / 12
        for sub in subscriptions
    )
    
    if monthly_subs_cost > 1000:
        recommendations.append({
            "title": "Review Subscriptions",
            "description": f"You're spending ₹{monthly_subs_cost:.2f}/month on subscriptions. Cancel unused ones!",
            "potential_savings": monthly_subs_cost * 0.3,  # Assume 30% can be saved
            "category": "Subscriptions",
            "priority": "medium"
        })
    
    # Analyze transport spending
    transport_expenses = [e for e in expenses if e["category"] == "Transport"]
    if len(transport_expenses) > 10:
        monthly_transport = sum(e["amount"] for e in transport_expenses)
        if monthly_transport > 3000:
            recommendations.append({
                "title": "Consider Public Transport",
                "description": f"Spending ₹{monthly_transport:.2f}/month on transport. Public transport could save you money!",
                "potential_savings": monthly_transport * 0.4,
                "category": "Transport",
                "priority": "medium"
            })
    
    return {"recommendations": recommendations}

# ============ CATEGORY-LEVEL INSIGHTS ============

@api_router.get("/analytics/category/{category}")
async def get_category_insights(category: str, user_id: str = "default_user"):
    expenses = await db.expenses.find({"user_id": user_id, "category": category}, {"_id": 0}).to_list(1000)
    
    if not expenses:
        return {"message": "No data for this category"}
    
    # Group by month
    monthly_data = {}
    for expense in expenses:
        month = expense["date"][:7]  # YYYY-MM
        monthly_data[month] = monthly_data.get(month, 0) + expense["amount"]
    
    sorted_months = sorted(monthly_data.items())
    
    total_spent = sum(e["amount"] for e in expenses)
    avg_per_month = total_spent / len(monthly_data) if monthly_data else 0
    
    best_month = min(monthly_data.items(), key=lambda x: x[1]) if monthly_data else ("", 0)
    worst_month = max(monthly_data.items(), key=lambda x: x[1]) if monthly_data else ("", 0)
    
    return {
        "category": category,
        "total_spent": total_spent,
        "total_transactions": len(expenses),
        "average_per_month": avg_per_month,
        "average_per_transaction": total_spent / len(expenses),
        "best_month": {"month": best_month[0], "amount": best_month[1]},
        "worst_month": {"month": worst_month[0], "amount": worst_month[1]},
        "monthly_trend": [{"month": m, "amount": a} for m, a in sorted_months],
        "suggestion": f"Try to keep {category} spending below ₹{avg_per_month * 0.9:.2f}/month"
    }

# ============ WEEKLY REPORTS ============

@api_router.get("/reports/weekly")
async def generate_weekly_report(user_id: str = "default_user"):
    # Get last 7 days data
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    expenses = await db.expenses.find({
        "user_id": user_id,
        "date": {"$gte": week_ago}
    }, {"_id": 0}).to_list(1000)
    
    income = await db.income.find({
        "user_id": user_id,
        "date": {"$gte": week_ago}
    }, {"_id": 0}).to_list(1000)
    
    total_expenses = sum(e["amount"] for e in expenses)
    total_income = sum(i["amount"] for i in income)
    savings = total_income - total_expenses
    
    # Category breakdown
    category_breakdown = {}
    for expense in expenses:
        cat = expense["category"]
        category_breakdown[cat] = category_breakdown.get(cat, 0) + expense["amount"]
    
    top_category = max(category_breakdown.items(), key=lambda x: x[1]) if category_breakdown else ("None", 0)
    
    # Biggest purchase
    biggest_purchase = max(expenses, key=lambda x: x["amount"]) if expenses else None
    
    # Next week target (20% less than this week)
    next_week_target = total_expenses * 0.8
    
    report = {
        "week_start": week_ago[:10],
        "week_end": datetime.now(timezone.utc).isoformat()[:10],
        "total_spending": total_expenses,
        "total_income": total_income,
        "savings": savings,
        "top_category": {"name": top_category[0], "amount": top_category[1]},
        "biggest_purchase": biggest_purchase,
        "transaction_count": len(expenses),
        "next_week_target": next_week_target,
        "category_breakdown": category_breakdown
    }
    
    return report

@api_router.post("/reports/weekly/email")
async def email_weekly_report(user_id: str = "default_user", email: str = Body(..., embed=True)):
    """Send weekly report via email"""
    report = await generate_weekly_report(user_id)
    
    # For now, just return the report (email integration can be added)
    # In production, use aiosmtplib to send email
    
    return {
        "message": "Weekly report generated (email sending not configured yet)",
        "report": report,
        "recipient": email
    }

# ============ ADVANCED AI FEATURES ============

@api_router.post("/ai/financial-story")
async def generate_financial_story(user_id: str = "default_user"):
    """Generate a creative financial story/summary"""
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    income = await db.income.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    total_expenses = sum(e["amount"] for e in expenses)
    total_income = sum(i["amount"] for i in income)
    
    # Category breakdown
    category_breakdown = {}
    for expense in expenses:
        cat = expense["category"]
        category_breakdown[cat] = category_breakdown.get(cat, 0) + expense["amount"]
    
    top_category = max(category_breakdown.items(), key=lambda x: x[1])[0] if category_breakdown else "Unknown"
    
    prompt = f'''Create an engaging, story-style financial summary for this user:

Total Income: ₹{total_income}
Total Expenses: ₹{total_expenses}
Savings: ₹{total_income - total_expenses}
Top Spending Category: {top_category}
Number of Transactions: {len(expenses)}

Write it as:
1. A short narrative (2-3 paragraphs)
2. Use storytelling elements (metaphors, journey language)
3. Make it motivational and insightful
4. Add emojis for engagement
5. End with actionable advice

Style: Friendly, witty, encouraging'''
    
    story = await get_ai_response(prompt, "You are a creative financial storyteller who makes finance fun and engaging.")
    
    return {"story": story}

@api_router.post("/ai/habit-correction")
async def habit_correction_analysis(user_id: str = "default_user"):
    """Neural habit correction engine - identify and suggest habit changes"""
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Analyze patterns
    late_night_purchases = []
    weekend_purchases = []
    impulsive_purchases = []
    
    for expense in expenses:
        date = datetime.fromisoformat(expense["date"].replace("Z", "+00:00"))
        hour = date.hour
        weekday = date.strftime("%A")
        
        if hour >= 22 or hour <= 4:
            late_night_purchases.append(expense)
        
        if weekday in ["Saturday", "Sunday"]:
            weekend_purchases.append(expense)
        
        # Impulsive = high amount + food/shopping
        if expense["amount"] > 500 and expense["category"] in ["Food", "Shopping"]:
            impulsive_purchases.append(expense)
    
    prompt = f'''Analyze these spending habits and provide habit correction recommendations:

Late Night Purchases: {len(late_night_purchases)} transactions, ₹{sum(e["amount"] for e in late_night_purchases)}
Weekend Purchases: {len(weekend_purchases)} transactions, ₹{sum(e["amount"] for e in weekend_purchases)}
Potentially Impulsive: {len(impulsive_purchases)} transactions, ₹{sum(e["amount"] for e in impulsive_purchases)}

Provide:
1. Top 3 habits to break
2. Specific challenges (e.g., "No late-night food orders this week")
3. Psychological triggers identified
4. Replacement behaviors
5. Expected savings if habits are corrected

Format as actionable JSON with clear recommendations.'''
    
    analysis = await get_ai_response(prompt, "You are a behavioral psychologist specializing in financial habits.")
    
    return {
        "analysis": analysis,
        "patterns": {
            "late_night_count": len(late_night_purchases),
            "weekend_count": len(weekend_purchases),
            "impulsive_count": len(impulsive_purchases)
        }
    }

@api_router.post("/ai/emotional-spending")
async def emotional_spending_predictor(user_id: str = "default_user"):
    """Predict emotional spending patterns"""
    expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Analyze time patterns
    hourly_spending = {}
    for expense in expenses:
        date = datetime.fromisoformat(expense["date"].replace("Z", "+00:00"))
        hour = date.hour
        hourly_spending[hour] = hourly_spending.get(hour, 0) + expense["amount"]
    
    # Find emotional spending hours
    avg_spending = sum(hourly_spending.values()) / len(hourly_spending) if hourly_spending else 0
    emotional_hours = [h for h, amt in hourly_spending.items() if amt > avg_spending * 1.5]
    
    prompt = f'''Analyze emotional spending patterns:

Total Transactions: {len(expenses)}
High-spending hours: {emotional_hours}
Average hourly spend: ₹{avg_spending:.2f}

Identify:
1. Emotional triggers (stress, boredom, happiness, sadness)
2. Time-based patterns
3. Likely emotional states during spending
4. Predictive warnings for future
5. Coping strategies

Provide psychological insights and preventive measures.'''
    
    prediction = await get_ai_response(prompt, "You are a financial psychologist analyzing emotional spending behaviors.")
    
    return {
        "prediction": prediction,
        "emotional_hours": emotional_hours,
        "risk_level": "high" if len(emotional_hours) > 5 else "medium" if len(emotional_hours) > 2 else "low"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ============ GLOBAL EXCEPTION HANDLER ============
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logging.error(f"Unhandled exception on {request.url.path}: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Failed to get data",
                    "data": [],
                    "message": "Service temporarily unavailable"
                }
            )

app.add_middleware(GlobalExceptionMiddleware)
