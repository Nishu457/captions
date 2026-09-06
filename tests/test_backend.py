"""
Unit tests for backend services and models.
Can be executed anywhere (Laptop A or Laptop B) with: python -m unittest tests/test_backend.py
"""

import unittest
from backend.models.caption_models import CaptionItem, CaptionStyle
from backend.services.caption_service import caption_service
from backend.services.gpu_service import gpu_service

class TestCaptionService(unittest.TestCase):
    def setUp(self):
        self.sample_captions = [
            CaptionItem(id="c1", start=1.0, end=3.5, text="Hello world"),
            CaptionItem(id="c2", start=3.6, end=6.2, text="This is an automated caption test")
        ]
        self.style = CaptionStyle(
            fontFamily="Inter, sans-serif",
            fontSize=28,
            textColor="#FFFF00",
            backgroundColor="#000000",
            position="bottom",
            alignment="center"
        )

    def test_srt_generation(self):
        srt = caption_service.to_srt(self.sample_captions)
        self.assertIn("00:00:01,000 --> 00:00:03,500", srt)
        self.assertIn("Hello world", srt)
        self.assertIn("00:00:03,600 --> 00:00:06,200", srt)

    def test_vtt_generation(self):
        vtt = caption_service.to_vtt(self.sample_captions)
        self.assertTrue(vtt.startswith("WEBVTT"))
        self.assertIn("00:00:01.000 --> 00:00:03.500", vtt)

    def test_ass_generation(self):
        ass = caption_service.to_ass(self.sample_captions, self.style)
        self.assertIn("[Script Info]", ass)
        self.assertIn("[V4+ Styles]", ass)
        self.assertIn("Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,Hello world", ass)

    def test_split_caption(self):
        split = caption_service.split_caption(
            self.sample_captions,
            caption_id="c1",
            split_time=2.2
        )
        self.assertEqual(len(split), 3)
        self.assertEqual(split[0].id, "c1_a")
        self.assertEqual(split[0].start, 1.0)
        self.assertEqual(split[0].end, 2.2)
        self.assertEqual(split[1].id, "c1_b")
        self.assertEqual(split[1].start, 2.2)
        self.assertEqual(split[1].end, 3.5)

    def test_merge_captions(self):
        merged = caption_service.merge_captions(
            self.sample_captions,
            first_id="c1",
            second_id="c2"
        )
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0].start, 1.0)
        self.assertEqual(merged[0].end, 6.2)
        self.assertIn("Hello world", merged[0].text)
        self.assertIn("automated caption test", merged[0].text)

    def test_gpu_service_status(self):
        status = gpu_service.get_status()
        self.assertIn("torchAvailable", status)
        self.assertIn("cudaAvailable", status)
        self.assertIn("device", status)

if __name__ == "__main__":
    unittest.main()
