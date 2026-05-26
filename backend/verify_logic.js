// Independent verification script to test TaskFlow priority scoring and filters in isolation

const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

// Priority Score Formula
// priorityScore = (importance * 10) + (100 / max(daysUntilDue, 1))
// rounded to 2 decimals. Returns 0 for completed tasks.
const computePriorityScore = (task) => {
  if (task.status === 'completed') {
    return 0.00;
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const diffTime = dueDate.getTime() - now.getTime();
  
  // Convert to full days, rounded down
  let daysUntilDue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 1) {
    daysUntilDue = 1;
  }

  const score = (task.importance * 10) + (100 / daysUntilDue);
  return Number(score.toFixed(2));
};

function runTest(description, assertFn) {
  try {
    assertFn();
    console.log(`✅ PASS: ${description}`);
  } catch (error) {
    console.error(`❌ FAIL: ${description}`);
    console.error(`   Error: ${error.message}`);
  }
}

function startTests() {
  console.log('=== Running TaskFlow Logic Verification Tests ===\n');

  // Test 1: Completed Task Priority Score
  runTest('Completed task always returns priorityScore = 0', () => {
    const task = {
      title: 'Completed Task',
      importance: 5,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      status: 'completed'
    };

    const score = computePriorityScore(task);
    if (score !== 0.00) {
      throw new Error(`Expected score to be 0, got ${score}`);
    }
  });

  // Test 2: Standard Future Task Priority Score
  runTest('Standard future task priorityScore matches formula exactly (e.g. importance=5, due in 5 days)', () => {
    const fiveDaysInFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600000); // 5d + 1h to avoid precision rounding boundary
    const task = {
      title: 'Standard Task',
      importance: 5,
      dueDate: fiveDaysInFuture,
      status: 'pending'
    };

    const score = computePriorityScore(task);
    // Formula: (5 * 10) + (100 / 5) = 50 + 20 = 70.00
    if (score !== 70.00) {
      throw new Error(`Expected score to be 70.00, got ${score}`);
    }
  });

  // Test 3: Past Due Task Priority Score
  runTest('Overdue/due-today task sets daysUntilDue floor to 1 day to avoid negative division', () => {
    const pastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days in past
    const task = {
      title: 'Overdue Task',
      importance: 3,
      dueDate: pastDue,
      status: 'pending'
    };

    const score = computePriorityScore(task);
    // Formula: (3 * 10) + (100 / max(-2, 1)) = 30 + 100 = 130.00
    if (score !== 130.00) {
      throw new Error(`Expected score to be 130.00, got ${score}`);
    }
  });

  // Test 4: Importance Rating Limits
  runTest('Validator allows integer importance values between 1 and 5 only', () => {
    const isValidImportance = (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 5 && Number.isInteger(num);
    };

    if (!isValidImportance(1)) throw new Error('Importance 1 should be valid');
    if (!isValidImportance(5)) throw new Error('Importance 5 should be valid');
    if (isValidImportance(0)) throw new Error('Importance 0 should NOT be valid');
    if (isValidImportance(6)) throw new Error('Importance 6 should NOT be valid');
    if (isValidImportance(3.5)) throw new Error('Importance 3.5 should NOT be valid');
  });

  console.log('\n=== Logic verification completed ===');
}

startTests();
