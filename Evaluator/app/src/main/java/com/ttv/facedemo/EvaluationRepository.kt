package com.ttv.facedemo

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.ttv.face.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.io.File

private const val TAG: String = "EvaluationRepository"

data class PerformanceMetrics(
    val confusionMatrix: List<List<Int>>,
    val precisions: List<Double>,
    val recalls: List<Double>,
    val microF1: Double,
    val macroF1: Double,
    val accuracy: Double,
)

class EvaluationRepository(context: Context) {
    private val faceEngine: FaceEngine
    private val photoDirectories: Array<File>

    init {
        faceEngine = FaceEngine.getInstance(context)
        faceEngine.setActivation("")
        faceEngine.init(1)

        photoDirectories = runBlocking(Dispatchers.IO) {
            File(context.getExternalFilesDir(null), PHOTOS_DIR_NAME)
                .listFiles { file -> file.isDirectory }
                ?: emptyArray()
        }
    }

    suspend fun evaluatePerformance(): Pair<PerformanceMetrics, List<String>> = withContext(Dispatchers.Default) {
        val errors = mutableListOf<String>()

        registerAllReferenceFaces(errors)
        val confusionMatrix = recognizeFacesAndGenerateConfusionMatrix(errors)
        val performanceMetrics = getPerformanceMetrics(confusionMatrix)

        Pair(performanceMetrics, errors)
    }

    private fun registerAllReferenceFaces(accumulatedErrors: MutableList<String>) {
        photoDirectories
            .map { dir ->
                dir.listFiles { file -> file.isFile && file.name.startsWith(REFERENCE_PREFIX) }!!.first()
            }
            .forEachIndexed { index, file ->
                try {
                    registerFace(personId = index, faceBitmap = BitmapFactory.decodeFile(file.path))
                } catch (e: Exception) {
                    accumulatedErrors += e.message!!
                }
            }
    }

    private fun registerFace(personId: Int, faceBitmap: Bitmap) {
        val results: MutableList<FaceResult> = faceEngine.detectFace(faceBitmap)
        if (results.count() != 1)
            throw Exception("Reference photo for person #${personId + 1} contains ${if (results.count() > 1) "more than one" else "no"} faces")
        faceEngine.extractFeature(faceBitmap, true, results)
        faceEngine.registerFaceFeature(FaceFeatureInfo(personId, results[0].feature))
    }

    private fun recognizeFacesAndGenerateConfusionMatrix(accumulatedErrors: MutableList<String>): List<List<Int>> {
        val confusionMatrix: List<MutableList<Int>> =
            List(size = photoDirectories.size) {
                MutableList(size = photoDirectories.size) { 0 }
            }

        fun updateConfusionMatrix(actualPerson: Int, recognizedPerson: Int?) {
            recognizedPerson ?: throw Exception("Recognized person is null")
            confusionMatrix[actualPerson][recognizedPerson]++
        }

        photoDirectories
            .map { dir ->
                dir.listFiles { file -> file.isFile } ?: emptyArray()
            }
            .forEachIndexed { index, files ->
                files.forEach { file ->
                    try {
                        val guess = recognizeFaceInPhoto(file)
                        updateConfusionMatrix(actualPerson = index, recognizedPerson = guess)
                    } catch (e: Exception) {
                        accumulatedErrors += e.message!!
                    }
                }
            }

        return confusionMatrix
    }

    private fun recognizeFaceInPhoto(file: File): Int {
        val faceBitmap: Bitmap = BitmapFactory.decodeFile(file.path)
        val recognitionResults: MutableList<FaceResult> = faceEngine.detectFace(faceBitmap)

        when (recognitionResults.count()) {
            0 -> throw Exception("File ${file.path} does not match any registered face")
            1 -> Unit
            else -> throw Exception("File ${file.path} matches multiple registered faces: ${recognitionResults.map { it.faceId }}")
        }

        // TODO: Should we check for liveness?
        faceEngine.livenessProcess(faceBitmap, recognitionResults) // run spoof check
        if (recognitionResults[0].liveness != 1)
            throw Exception("File ${file.path} failed the liveness check")

        faceEngine.extractFeature(faceBitmap, false, recognitionResults)
        val result: SearchResult = faceEngine.searchFaceFeature(FaceFeature(recognitionResults[0].feature))

        // TODO: Should we require a similarity threshold?
        // if (result.maxSimilar <= 0.82f)
        //     throw Exception("Not similar enough: file ${file.path}")

        return result.faceFeatureInfo?.searchId ?: throw Exception("API returned null for the recognized user's ID in file ${file.path}")
    }

    private fun getPerformanceMetrics(confusionMatrix: List<List<Int>>): PerformanceMetrics {
        fun timesCorrectlyPredicted(personId: Int) = confusionMatrix[personId][personId]

        val predictionCounts = confusionMatrix.map { row -> row.sum() }
        val precisions = predictionCounts
            .mapIndexed { i, timesPredicted -> timesCorrectlyPredicted(i) / timesPredicted.toDouble() }

        val occurrenceCounts = MutableList(size = confusionMatrix.size) { 0 }
        for (row in confusionMatrix.indices)
            for (col in confusionMatrix.indices)
                occurrenceCounts[col] += confusionMatrix[row][col]
        val recalls = occurrenceCounts.mapIndexed { i, sum -> timesCorrectlyPredicted(i) / sum.toDouble() }

        val totalFalsePositives = predictionCounts
            .mapIndexed { i, timesPredicted -> timesPredicted - timesCorrectlyPredicted(i) }
            .sum()
        val totalFalseNegatives = occurrenceCounts
            .mapIndexed { i, count -> count - timesCorrectlyPredicted(i) }
            .sum()
        val totalTruePositives = List(size = confusionMatrix.size) { i -> timesCorrectlyPredicted(i) }.sum()
        val microF1 = totalTruePositives / (totalTruePositives + 0.5 * (totalFalsePositives + totalFalseNegatives))

        val macroF1 = (precisions zip recalls)
            .sumOf { (precision, recall) ->
                2 * precision * recall / (precision + recall)
            }

        val totalTests = predictionCounts.sum()
        val accuracy = totalTruePositives / totalTests.toDouble()

        return PerformanceMetrics(
            confusionMatrix = confusionMatrix,
            precisions = precisions,
            recalls = recalls,
            microF1 = microF1,
            macroF1 = macroF1,
            accuracy = accuracy
        )
    }
}
