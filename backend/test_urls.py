from unittest import TestCase
import requests

class TestEndPoints(TestCase):
	def test_graphana(self):
		url = "http://grafana:3000"
		response = requests.get(url)
		self.assertEqual(response.ok, True)
	def test_django(self):
		django_url = "http://localhost:8000"
		django_metrics_url = "http://localhost:8000/metrics"
		django_reponse = requests.get(django_url)
		django_metrics_reponse = requests.get(django_metrics_url)
		self.assertEqual(django_reponse.ok, True)
		self.assertEqual(django_metrics_reponse.ok, True)
	def test_prometheus(self):
		prometheus_url = "http://prometheus:9090"
		prometheus_metrics_url = "http://prometheus:9090/metrics"
		prometheus_reponse = requests.get(prometheus_url)
		prometheus_metrics_reponse = requests.get(prometheus_metrics_url)
		self.assertEqual(prometheus_reponse.ok, True)
		self.assertEqual(prometheus_metrics_reponse.ok, True)
	def test_alertmanager(self):
		alertmanager_metrics_url = "http://alertmanager:9093/metrics"
		alertmanager_metrics_reponse = requests.get(alertmanager_metrics_url)
		self.assertEqual(alertmanager_metrics_reponse.ok, True)