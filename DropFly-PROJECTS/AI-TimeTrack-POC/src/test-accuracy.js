/**
 * AI Categorization Accuracy Testing
 * Tests AI categorization against ground truth data
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const AICategorizer = require('./ai-categorizer');

class AccuracyTester {
  constructor() {
    this.categorizer = new AICategorizer();
  }

  /**
   * Calculate string similarity (for fuzzy matching)
   */
  stringSimilarity(str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();

    if (str1 === str2) return 1.0;

    // Check if one contains the other
    if (str1.includes(str2) || str2.includes(str1)) {
      return 0.9;
    }

    // Simple word overlap similarity
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Evaluate a single prediction against ground truth
   */
  evaluatePrediction(prediction, groundTruth) {
    // Exact matches
    const clientMatch = prediction.client === groundTruth.client;
    const matterMatch = prediction.matter === groundTruth.matter;
    const activityTypeMatch = prediction.activityType === groundTruth.activityType;

    // Fuzzy matches (for partial credit)
    const clientSimilarity = this.stringSimilarity(prediction.client, groundTruth.client);
    const matterSimilarity = this.stringSimilarity(prediction.matter, groundTruth.matter);
    const activitySimilarity = this.stringSimilarity(prediction.activityType, groundTruth.activityType);

    // Overall accuracy (weighted average)
    const overallAccuracy = (
      clientSimilarity * 0.4 +  // Client is most important (40%)
      matterSimilarity * 0.4 +   // Matter is equally important (40%)
      activitySimilarity * 0.2   // Activity type is less critical (20%)
    );

    return {
      clientMatch,
      matterMatch,
      activityTypeMatch,
      clientSimilarity,
      matterSimilarity,
      activitySimilarity,
      overallAccuracy,
      confidence: prediction.confidence,
      processingTime: prediction.processingTime
    };
  }

  /**
   * Run accuracy test on all sample activities
   */
  async runTest() {
    console.log('🧪 AI Categorization Accuracy Test\n');
    console.log('=' .repeat(80));

    // Load sample activities
    const sampleActivities = JSON.parse(
      await fs.readFile(
        path.join(__dirname, '../data/sample-activities.json'),
        'utf-8'
      )
    );

    console.log(`\nTesting ${sampleActivities.length} activities...\n`);

    // Categorize all activities
    const results = await this.categorizer.categorizeBatch(
      sampleActivities,
      (current, total) => {
        const progress = ((current / total) * 100).toFixed(0);
        process.stdout.write(`\rProgress: ${progress}% (${current}/${total})`);
      }
    );

    console.log('\n\n' + '='.repeat(80));
    console.log('📊 ACCURACY REPORT\n');

    // Evaluate each result
    const evaluations = results.map(r => ({
      activityId: r.activityId,
      activity: r.activity,
      prediction: r.prediction,
      groundTruth: r.groundTruth,
      evaluation: this.evaluatePrediction(r.prediction, r.groundTruth)
    }));

    // Calculate aggregate metrics
    const metrics = this.calculateAggregateMetrics(evaluations);

    // Print summary
    this.printSummary(metrics);

    // Print detailed results
    console.log('\n📋 DETAILED RESULTS\n');
    this.printDetailedResults(evaluations);

    // Save results
    await this.saveResults(evaluations, metrics);

    return { evaluations, metrics };
  }

  /**
   * Calculate aggregate metrics
   */
  calculateAggregateMetrics(evaluations) {
    const total = evaluations.length;

    const clientMatches = evaluations.filter(e => e.evaluation.clientMatch).length;
    const matterMatches = evaluations.filter(e => e.evaluation.matterMatch).length;
    const activityMatches = evaluations.filter(e => e.evaluation.activityTypeMatch).length;

    const avgClientSimilarity = evaluations.reduce((sum, e) => sum + e.evaluation.clientSimilarity, 0) / total;
    const avgMatterSimilarity = evaluations.reduce((sum, e) => sum + e.evaluation.matterSimilarity, 0) / total;
    const avgActivitySimilarity = evaluations.reduce((sum, e) => sum + e.evaluation.activitySimilarity, 0) / total;
    const avgOverallAccuracy = evaluations.reduce((sum, e) => sum + e.evaluation.overallAccuracy, 0) / total;

    const avgConfidence = evaluations.reduce((sum, e) => sum + e.evaluation.confidence, 0) / total;
    const avgProcessingTime = evaluations.reduce((sum, e) => sum + e.evaluation.processingTime, 0) / total;

    // Confidence calibration (are high-confidence predictions actually more accurate?)
    const highConfidencePredictions = evaluations.filter(e => e.evaluation.confidence >= 0.8);
    const highConfidenceAccuracy = highConfidencePredictions.length > 0
      ? highConfidencePredictions.reduce((sum, e) => sum + e.evaluation.overallAccuracy, 0) / highConfidencePredictions.length
      : 0;

    const lowConfidencePredictions = evaluations.filter(e => e.evaluation.confidence < 0.8);
    const lowConfidenceAccuracy = lowConfidencePredictions.length > 0
      ? lowConfidencePredictions.reduce((sum, e) => sum + e.evaluation.overallAccuracy, 0) / lowConfidencePredictions.length
      : 0;

    return {
      total,
      clientAccuracy: (clientMatches / total) * 100,
      matterAccuracy: (matterMatches / total) * 100,
      activityTypeAccuracy: (activityMatches / total) * 100,
      avgClientSimilarity: avgClientSimilarity * 100,
      avgMatterSimilarity: avgMatterSimilarity * 100,
      avgActivitySimilarity: avgActivitySimilarity * 100,
      overallAccuracy: avgOverallAccuracy * 100,
      avgConfidence: avgConfidence * 100,
      avgProcessingTime,
      highConfidenceAccuracy: highConfidenceAccuracy * 100,
      lowConfidenceAccuracy: lowConfidenceAccuracy * 100,
      highConfidenceCount: highConfidencePredictions.length,
      lowConfidenceCount: lowConfidencePredictions.length
    };
  }

  /**
   * Print summary metrics
   */
  printSummary(metrics) {
    console.log('🎯 Exact Match Accuracy:');
    console.log(`   Client:        ${metrics.clientAccuracy.toFixed(1)}% (${this.getStatusEmoji(metrics.clientAccuracy, 95)})`);
    console.log(`   Matter:        ${metrics.matterAccuracy.toFixed(1)}% (${this.getStatusEmoji(metrics.matterAccuracy, 85)})`);
    console.log(`   Activity Type: ${metrics.activityTypeAccuracy.toFixed(1)}% (${this.getStatusEmoji(metrics.activityTypeAccuracy, 80)})`);

    console.log('\n📈 Fuzzy Match Similarity:');
    console.log(`   Client:        ${metrics.avgClientSimilarity.toFixed(1)}%`);
    console.log(`   Matter:        ${metrics.avgMatterSimilarity.toFixed(1)}%`);
    console.log(`   Activity Type: ${metrics.avgActivitySimilarity.toFixed(1)}%`);

    console.log(`\n🏆 Overall Accuracy: ${metrics.overallAccuracy.toFixed(1)}% (${this.getStatusEmoji(metrics.overallAccuracy, 90)})`);

    console.log(`\n💪 Average Confidence: ${metrics.avgConfidence.toFixed(1)}%`);

    console.log('\n🔍 Confidence Calibration:');
    console.log(`   High Confidence (≥80%): ${metrics.highConfidenceAccuracy.toFixed(1)}% accuracy (n=${metrics.highConfidenceCount})`);
    console.log(`   Low Confidence (<80%):  ${metrics.lowConfidenceAccuracy.toFixed(1)}% accuracy (n=${metrics.lowConfidenceCount})`);

    console.log(`\n⚡ Avg Processing Time: ${metrics.avgProcessingTime.toFixed(0)}ms per activity`);

    console.log('\n' + '='.repeat(80));
    console.log(this.getFinalVerdict(metrics));
    console.log('='.repeat(80));
  }

  /**
   * Get status emoji based on threshold
   */
  getStatusEmoji(value, threshold) {
    if (value >= threshold) return '✅ PASS';
    if (value >= threshold - 10) return '⚠️  CLOSE';
    return '❌ FAIL';
  }

  /**
   * Get final verdict
   */
  getFinalVerdict(metrics) {
    if (metrics.overallAccuracy >= 90) {
      return '✅ SUCCESS! AI categorization meets production requirements (≥90% accuracy).\n   Ready to proceed with MVP development.';
    } else if (metrics.overallAccuracy >= 80) {
      return '⚠️  CLOSE. AI categorization shows promise (80-90% accuracy).\n   Recommend prompt refinement and additional training data.';
    } else {
      return '❌ NEEDS WORK. AI categorization below target (<80% accuracy).\n   Consider rule-based fallbacks or hybrid approach.';
    }
  }

  /**
   * Print detailed results for each activity
   */
  printDetailedResults(evaluations) {
    evaluations.forEach((e, index) => {
      const isCorrect = e.evaluation.overallAccuracy >= 0.9;
      const icon = isCorrect ? '✅' : '❌';

      console.log(`${icon} Activity ${index + 1}: ${e.activity.windowTitle}`);
      console.log(`   Ground Truth: ${e.groundTruth.client} → ${e.groundTruth.matter}`);
      console.log(`   Predicted:    ${e.prediction.client} → ${e.prediction.matter}`);
      console.log(`   Accuracy: ${(e.evaluation.overallAccuracy * 100).toFixed(1)}% | Confidence: ${(e.evaluation.confidence * 100).toFixed(1)}%`);

      if (!isCorrect) {
        console.log(`   ⚠️  Reasoning: ${e.prediction.reasoning}`);
      }

      console.log('');
    });
  }

  /**
   * Save results to files
   */
  async saveResults(evaluations, metrics) {
    const resultsDir = path.join(__dirname, '../tests');
    await fs.mkdir(resultsDir, { recursive: true });

    // Save detailed results
    const detailedResults = {
      timestamp: new Date().toISOString(),
      metrics,
      evaluations: evaluations.map(e => ({
        activityId: e.activityId,
        activity: {
          application: e.activity.application,
          windowTitle: e.activity.windowTitle,
          duration: e.activity.duration
        },
        groundTruth: e.groundTruth,
        prediction: {
          client: e.prediction.client,
          matter: e.prediction.matter,
          activityType: e.prediction.activityType,
          description: e.prediction.description,
          confidence: e.prediction.confidence,
          reasoning: e.prediction.reasoning
        },
        evaluation: e.evaluation
      }))
    };

    await fs.writeFile(
      path.join(resultsDir, 'accuracy-report.json'),
      JSON.stringify(detailedResults, null, 2)
    );

    console.log(`\n💾 Results saved to: tests/accuracy-report.json`);
  }
}

// Run test if called directly
if (require.main === module) {
  (async () => {
    const tester = new AccuracyTester();
    await tester.runTest();
  })().catch(error => {
    console.error('Error running test:', error);
    process.exit(1);
  });
}

module.exports = AccuracyTester;
